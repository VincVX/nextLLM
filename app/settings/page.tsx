"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Assuming Shadcn select components
import Link from "next/link"; // Next.js Link component for navigation
import { Home } from "lucide-react"; // Import Home icon from lucide-react

export default function Settings() {
  const [apiKey, setApiKey] = useState<string>(""); // Track the API key
  const [selectedModel, setSelectedModel] = useState<string>("gpt-3.5-turbo"); // Default model selection
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // Track success message
  const [testMessage, setTestMessage] = useState<string | null>(null); // Track test message
  const [isFading, setIsFading] = useState(false); // Track fading effect for success message
  const [loading, setLoading] = useState(false); // Track loading state for test button

  // Load API key and model from local storage on component mount
  useEffect(() => {
    const storedApiKey = localStorage.getItem("apiKey");
    const storedModel = localStorage.getItem("selectedModel");
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
    if (storedModel) {
      setSelectedModel(storedModel); // Load selected model if it exists in local storage
    }
  }, []);

  const handleSaveApiKey = () => {
    // Save API key to local storage
    if (apiKey) {
      localStorage.setItem("apiKey", apiKey);
      setSuccessMessage("API key saved!"); // Set success message
      setIsFading(false); // Reset fading

      // Fade out the success message after a few seconds
      setTimeout(() => {
        setIsFading(true);
        setTimeout(() => {
          setSuccessMessage(null); // Remove the message completely after fading out
        }, 500); // 500ms fade out duration
      }, 3000); // Display the message for 3 seconds
    }
  };

  const handleModelChange = (value: string) => {
    // Update selected model and save it to local storage
    setSelectedModel(value);
    localStorage.setItem("selectedModel", value); // Save the selected model
  };

  const testApiKey = async () => {
    setLoading(true); // Set loading state to true
    setTestMessage(null); // Reset test message
    setIsFading(false); // Reset fading state

    try {
      const response = await fetch("https://api.openai.com/v1/models", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`, // Use the API key saved in the input field
        },
      });

      if (response.ok) {
        setTestMessage("API key is valid!"); // Success message
      } else {
        setTestMessage("Invalid API key or error occurred."); // Failure message
      }
    } catch (error) {
      setTestMessage("Error testing API key. Please try again.");
    } finally {
      setLoading(false); // Reset loading state
      setTimeout(() => {
        setIsFading(true);
        setTimeout(() => {
          setTestMessage(null); // Remove the message after fading out
        }, 500); // 500ms fade out duration
      }, 3000); // Display the message for 3 seconds
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      {/* Fixed Home button in the top-right corner */}
      <div className="fixed top-4 right-4">
        <Link href="/">
          <Button variant="ghost" className="flex items-center">
            <Home className="mr-2 h-4 w-4" />
            Home
          </Button>
        </Link>
      </div>

      <Card className="w-full max-w-md p-6">
        <CardContent>
          <h2 className="text-lg font-semibold mb-4">API Key Settings</h2>
          <p className="text-sm text-gray-500 mb-4">
            Enter your OpenAI API key to access GPT-3.5 features.
          </p>
          <Input
            type="password"
            value={apiKey}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setApiKey(e.target.value)
            }
            placeholder="Enter API Key"
            className="mb-4"
          />
          <Button onClick={handleSaveApiKey} className="w-full mb-4">
            Save API Key
          </Button>

          <Button
            onClick={testApiKey}
            className="w-full"
            disabled={loading || !apiKey.trim()}
          >
            {loading ? "Testing..." : "Test API Key"}
          </Button>

          {/* Model Selection */}
          <div className="mt-6">
            <h3 className="text-md font-medium mb-2">Choose Model</h3>
            <Select value={selectedModel} onValueChange={handleModelChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                <SelectItem value="gpt-4o-mini">gpt-4o-mini</SelectItem>
                <SelectItem value="gpt-4">GPT-4</SelectItem>
                <SelectItem value="o1-preview">o1-preview</SelectItem>
                <SelectItem value="o1-mini">o1-mini</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Success message for saving */}
          {successMessage && (
            <p
              className={`mt-4 text-green-600 transition-opacity duration-500 ${
                isFading ? "opacity-0" : "opacity-100"
              }`}
            >
              {successMessage}
            </p>
          )}

          {/* Test result message */}
          {testMessage && (
            <p
              className={`mt-4 text-blue-600 transition-opacity duration-500 ${
                isFading ? "opacity-0" : "opacity-100"
              }`}
            >
              {testMessage}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
