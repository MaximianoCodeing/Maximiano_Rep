// useRealtimeVoice
// Hook responsavel por toda a comunicacao de voz em tempo real com a
// OpenAI Realtime API atraves de WebRTC:
//   - obtem um token efemero do backend (/api/session)
//   - captura o microfone (com cancelamento de ruido/eco)
//   - abre uma RTCPeerConnection e negoceia SDP com a OpenAI
//   - reproduz o audio da IA
//   - recebe eventos (data channel) para atualizar estado e transcript
//   - suporta interrupcao natural (barge-in) e VAD do servidor
"use client";

import { useCallback, useRef, useState } from "react";
import type { Turn, VoiceState } from "@/lib/types";
import type { Level } from "@/lib/topics";

const REALTIME_URL = "https://api.openai.com/v1/realtime/calls";

export function useRealtimeVoice() {
  const [state, setState] = useState<VoiceState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<Turn[]>([]);
  // Intensidade do audio (0..1) para animar o circulo reativo.
  const [level, setLevel] = useState(0);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Buffers para montar o transcript a partir dos eventos incrementais.
  const userPartial = useRef<string>("");
  const aiPartial = useRef<string>("");

  // ---- Analise de volume para a animacao (usa o stream do microfone) ----
  const startMeter = useCallback((stream: MediaStream) => {
    const ctx = new AudioContext();
    audioCtxRef.current = ctx;
    const src = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    src.connect(analyser);
    const data = new Uint8Array(analyser.frequencyBinCount);

    const tick = () => {
      analyser.getByteTimeDomainData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        const v = (data[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / data.length);
      setLevel(Math.min(1, rms * 3));
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();
  }, []);

  // ---- Trata eventos vindos do data channel da Realtime API ----
  const handleServerEvent = useCallback((evt: MessageEvent) => {
    let msg: any;
    try {
      msg = JSON.parse(evt.data);
    } catch {
      return;
    }

    switch (msg.type) {
      // A IA comecou a produzir audio -> estado "speaking".
      case "response.audio.delta":
        setState("speaking");
        break;

      // Transcricao incremental da fala do UTILIZADOR.
      case "conversation.item.input_audio_transcription.delta":
        userPartial.current += msg.delta ?? "";
        break;
      case "conversation.item.input_audio_transcription.completed":
        if (msg.transcript) {
          setTranscript((t) => [...t, { role: "user", text: msg.transcript.trim() }]);
        }
        userPartial.current = "";
        break;

      // Transcricao incremental da resposta da IA (audio -> texto).
      case "response.audio_transcript.delta":
        aiPartial.current += msg.delta ?? "";
        break;
      case "response.audio_transcript.done":
        if (aiPartial.current.trim()) {
          setTranscript((t) => [...t, { role: "assistant", text: aiPartial.current.trim() }]);
        }
        aiPartial.current = "";
        break;

      // O servidor detetou que o utilizador comecou a falar (VAD).
      case "input_audio_buffer.speech_started":
        setState("listening");
        break;
      case "input_audio_buffer.speech_stopped":
        setState("thinking");
        break;

      // A resposta da IA terminou -> volta a escutar.
      case "response.done":
        setState("listening");
        break;

      case "error":
        setError(msg.error?.message || "Erro na sessao Realtime.");
        break;
    }
  }, []);

  // ---- Iniciar conversa ----
  const start = useCallback(
    async (topic: string, lvl: Level, uid?: string, mode: string = "teacher") => {
      setError(null);
      setTranscript([]);
      setState("connecting");

      try {
        // 1. Obter token efemero do backend (uid permite personalizar via memoria).
        const sessRes = await fetch("/api/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic, level: lvl, uid, mode }),
        });
        if (!sessRes.ok) {
          // Mostra o erro real devolvido pela API (visivel no ecra, sem devtools).
          let detail = "";
          try {
            const errJson = await sessRes.json();
            detail = errJson?.detail || errJson?.error || JSON.stringify(errJson);
          } catch {
            detail = await sessRes.text().catch(() => "");
          }
          throw new Error(`Sessao falhou (${sessRes.status}): ${detail.slice(0, 300)}`);
        }
        const sess = await sessRes.json();
        const ephemeralKey: string = sess?.client_secret?.value;
        if (!ephemeralKey) throw new Error(`Token efemero em falta. Resposta: ${JSON.stringify(sess).slice(0, 300)}`);

        // 2. Capturar microfone com processamento de audio.
        const micStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        micStreamRef.current = micStream;
        startMeter(micStream);

        // 3. Criar a ligacao WebRTC.
        const pc = new RTCPeerConnection();
        pcRef.current = pc;

        // Reproduzir o audio recebido da IA.
        const audioEl = new Audio();
        audioEl.autoplay = true;
        audioElRef.current = audioEl;
        pc.ontrack = (e) => {
          audioEl.srcObject = e.streams[0];
        };

        // Enviar o audio do microfone.
        pc.addTrack(micStream.getAudioTracks()[0], micStream);

        // Data channel para eventos JSON.
        const dc = pc.createDataChannel("oai-events");
        dcRef.current = dc;
        dc.addEventListener("message", handleServerEvent);
        dc.addEventListener("open", () => {
          // Pedir a IA para cumprimentar primeiro.
          dc.send(
            JSON.stringify({
              type: "response.create",
              response: { instructions: "Greet the student warmly and ask your first question." },
            })
          );
        });

        // 4. Negociar SDP com a OpenAI.
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        const sdpRes = await fetch(REALTIME_URL, {
          method: "POST",
          body: offer.sdp,
          headers: {
            Authorization: `Bearer ${ephemeralKey}`,
            "Content-Type": "application/sdp",
          },
        });
        if (!sdpRes.ok) throw new Error("Falha na negociacao WebRTC.");
        const answer = { type: "answer" as const, sdp: await sdpRes.text() };
        await pc.setRemoteDescription(answer);

        setState("listening");
      } catch (err) {
        setError(String((err as Error).message || err));
        setState("idle");
      }
    },
    [handleServerEvent, startMeter]
  );

  // ---- Terminar conversa e libertar recursos ----
  const stop = useCallback((): Turn[] => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    audioCtxRef.current?.close().catch(() => {});
    dcRef.current?.close();
    pcRef.current?.getSenders().forEach((s) => s.track?.stop());
    pcRef.current?.close();
    micStreamRef.current?.getTracks().forEach((t) => t.stop());
    if (audioElRef.current) audioElRef.current.srcObject = null;

    pcRef.current = null;
    dcRef.current = null;
    micStreamRef.current = null;
    setLevel(0);
    setState("idle");
    return transcript;
  }, [transcript]);

  return { state, error, transcript, level, start, stop };
}
