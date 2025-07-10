"use client";

import React, { useEffect } from "react";
import io, { Socket } from "socket.io-client";

import useConversationStore from "@/stores/useConversationStore";
import useTaskStore from "@/stores/useTaskStore";

let socket: Socket | null = null;

export function sendSocketMessage(msg: string) {
  socket?.emit("message", msg);
}

export function emitTestCaseInitiated(formData: any) {
  socket?.emit("testCaseInitiated", formData);
}

export function emitMobileTestCaseInitiated(formData: any) {
  socket?.emit("mobileTestCaseInitiated", formData);
}

export function emitTestCaseUpdate(status: string) {
  socket?.emit("testCaseUpdate", status);
}

export function SocketIOManager() {
  const addChatMessage = useConversationStore((s) => s.addChatMessage);
  const addConversationItem = useConversationStore((s) => s.addConversationItem);
  const setTestCases = useTaskStore((s) => s.setTestCases);
  const updateTestScript = useTaskStore((s) => s.updateTestScript);

  useEffect(() => {
    const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || "http://localhost:8000";
    socket = io(SOCKET_SERVER_URL);

    // Make socket globally available for device selection
    if (typeof window !== 'undefined') {
      (window as any).socket = socket;
    }

    socket.on("connect", () => {
      console.log("[socket] connected:", socket?.id);
    });

    socket.on("testcases", (msg: string) => {
      try {
        const parsed = JSON.parse(msg);
        if (Array.isArray(parsed.steps)) setTestCases(parsed.steps);
      } catch (err) {
        console.error("✖ parse testcases", err);
      }
    });

    socket.on("testscriptupdate", (payload: string | object) => {
      try {
        const parsed = typeof payload === "string" ? JSON.parse(payload) : payload;
        if (Array.isArray(parsed.steps)) updateTestScript(parsed.steps);
      } catch (err) {
        console.error("✖ parse testscriptupdate", err);
      }
    });

    socket.on("message", (msg: string) => {
      addChatMessage({
        type: "message",
        role: "assistant",
        content: [{ type: "output_text", text: msg }],
      } as any);

      addConversationItem({
        role: "assistant",
        content: msg,
        timestamp: new Date().toLocaleTimeString(),
      });
    });

    socket.on("mobileDevices", (devices: any[]) => {
      // This will be handled by the MobileDeviceSelector component
      console.log("Available mobile devices:", devices);
    });

    return () => {
      socket?.disconnect();
      socket = null;
      if (typeof window !== 'undefined') {
        delete (window as any).socket;
      }
    };
  }, [addChatMessage, addConversationItem, setTestCases, updateTestScript]);

  return null;
}
