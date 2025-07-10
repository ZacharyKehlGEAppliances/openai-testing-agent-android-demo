"use client";

import React, { useState, useEffect } from "react";
import { Smartphone, Tablet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface MobileDevice {
  name: string;
  platform: string;
  viewport: { width: number; height: number };
  userAgent: string;
}

interface MobileDeviceSelectorProps {
  onDeviceSelected: (deviceName: string) => void;
  selectedDevice: string | null;
}

export default function MobileDeviceSelector({ onDeviceSelected, selectedDevice }: MobileDeviceSelectorProps) {
  const [devices, setDevices] = useState<MobileDevice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This will be populated by the socket connection
    const handleMobileDevices = (deviceList: MobileDevice[]) => {
      setDevices(deviceList);
      setLoading(false);
    };

    // Get devices from socket
    if (typeof window !== 'undefined' && window.socket) {
      window.socket.on("mobileDevices", handleMobileDevices);
      window.socket.emit("getMobileDevices");
    }

    return () => {
      if (typeof window !== 'undefined' && window.socket) {
        window.socket.off("mobileDevices", handleMobileDevices);
      }
    };
  }, []);

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'ios':
        return <Smartphone className="h-5 w-5 text-gray-600" />;
      case 'android':
        return <Tablet className="h-5 w-5 text-green-600" />;
      default:
        return <Smartphone className="h-5 w-5 text-gray-600" />;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'ios':
        return 'bg-gray-100 text-gray-800';
      case 'android':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mobile Device Selection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading available devices...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Mobile Device</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {devices.map((device) => (
            <div
              key={device.name}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                selectedDevice === device.name
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => onDeviceSelected(device.name)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getPlatformIcon(device.platform)}
                  <span className="font-medium">{device.name}</span>
                </div>
                <Badge className={getPlatformColor(device.platform)}>
                  {device.platform.toUpperCase()}
                </Badge>
              </div>
              <div className="text-sm text-gray-600">
                {device.viewport.width} × {device.viewport.height}
              </div>
            </div>
          ))}
        </div>
        
        {selectedDevice && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="text-sm font-medium text-blue-800">
              Selected: {selectedDevice}
            </div>
            <div className="text-xs text-blue-600 mt-1">
              Ready to run mobile tests on this device
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
