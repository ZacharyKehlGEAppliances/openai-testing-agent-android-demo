"use client";

import { useState } from "react";
import { Monitor, Smartphone } from "lucide-react";
import ConfigPanel from "@/components/ConfigPanel";
import MobileConfigPanel from "@/components/MobileConfigPanel";
import SidePanel from "@/components/SidePanel";
import TaskSteps from "@/components/TaskSteps";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Main() {
  const [isSideOpen, setIsSideOpen] = useState(false);
  const [configSubmitted, setConfigSubmitted] = useState(false);
  const [testMode, setTestMode] = useState<"desktop" | "mobile">("desktop");

  const handleModeChange = (mode: "desktop" | "mobile") => {
    setTestMode(mode);
    setConfigSubmitted(false);
  };

  if (!configSubmitted) {
    return (
      <div className="flex flex-col h-full">
        <div className="sm:hidden flex items-center justify-between p-4 bg-gray-100 shrink-0">
          <h1 className="text-lg font-semibold">Testing Agent</h1>
          <button
            onClick={() => setIsSideOpen(true)}
            className="p-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <div className="flex flex-1 min-h-0">
          <div className="flex flex-col w-full sm:w-3/4 overflow-y-auto">
            <div className="w-full flex justify-center items-start p-4 md:p-6 max-w-4xl mx-auto">
              <div className="w-full">
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Select Testing Mode</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button
                        variant={testMode === "desktop" ? "default" : "outline"}
                        onClick={() => handleModeChange("desktop")}
                        className="flex items-center gap-2 p-6 h-auto"
                      >
                        <Monitor className="h-6 w-6" />
                        <div className="text-left">
                          <div className="font-medium">Desktop Testing</div>
                          <div className="text-sm opacity-70">Test web applications on desktop browsers</div>
                        </div>
                      </Button>
                      <Button
                        variant={testMode === "mobile" ? "default" : "outline"}
                        onClick={() => handleModeChange("mobile")}
                        className="flex items-center gap-2 p-6 h-auto"
                      >
                        <Smartphone className="h-6 w-6" />
                        <div className="text-left">
                          <div className="font-medium">Mobile Testing</div>
                          <div className="text-sm opacity-70">Test mobile apps on iOS and Android devices</div>
                        </div>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {testMode === "desktop" ? (
                  <ConfigPanel onSubmitted={() => setConfigSubmitted(true)} />
                ) : (
                  <MobileConfigPanel onSubmitted={() => setConfigSubmitted(true)} />
                )}
              </div>
            </div>
          </div>

          <div className="hidden sm:block sm:w-1/4 border-l h-full">
            <SidePanel />
          </div>
        </div>

        {isSideOpen && (
          <div className="fixed inset-0 z-50 flex bg-black/50" onClick={() => setIsSideOpen(false)}>
            <div className="ml-auto w-3/4 max-w-xs bg-white h-full shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-medium">Menu</h2>
                <button
                  onClick={() => setIsSideOpen(false)}
                  className="p-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-4 overflow-y-auto h-[calc(100%-64px)]">
                <SidePanel />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="sm:hidden flex items-center justify-between p-4 bg-gray-100 shrink-0">
        <h1 className="text-lg font-semibold">
          {testMode === "mobile" ? "Mobile Testing" : "Desktop Testing"}
        </h1>
        <button
          onClick={() => setIsSideOpen(true)}
          className="p-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <div className="flex flex-1 min-h-0">
        <div className="flex flex-col w-full sm:w-3/4 overflow-y-auto">
          {testMode === "desktop" ? (
            <ConfigPanel onSubmitted={() => setConfigSubmitted(true)} />
          ) : (
            <MobileConfigPanel onSubmitted={() => setConfigSubmitted(true)} />
          )}
          <TaskSteps />
        </div>

        <div className="hidden sm:block sm:w-1/4 border-l h-full">
          <SidePanel />
        </div>
      </div>

      {isSideOpen && (
        <div className="fixed inset-0 z-50 flex bg-black/50" onClick={() => setIsSideOpen(false)}>
          <div className="ml-auto w-3/4 max-w-xs bg-white h-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-medium">Menu</h2>
              <button
                onClick={() => setIsSideOpen(false)}
                className="p-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 overflow-y-auto h-[calc(100%-64px)]">
              <SidePanel />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
