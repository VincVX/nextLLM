"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css"; // KaTeX CSS for LaTeX rendering
import rehypeHighlight from "rehype-highlight"; // For code highlighting
import "highlight.js/styles/github.css"; // GitHub code highlighting style
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { Terminal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export default function Home() {
  const [messages, setMessages] = useState<
    { role: string; content: string; visible: boolean }[]
  >([]); // State for both user and assistant messages
  const [loading, setLoading] = useState(false);
  const [userInput, setUserInput] = useState<string>("");
  const [error, setError] = useState<string | null>(null); // State to store error messages
  const [isFading, setIsFading] = useState(false); // State to track if the alert is fading
  const [apiKey, setApiKey] = useState<string | null>(null); // State for API key
  const [selectedModel, setSelectedModel] = useState<string>("gpt-3.5-turbo"); // Default model

  // Load API key and model from local storage when the component mounts
  useEffect(() => {
    const storedApiKey = localStorage.getItem("apiKey");
    const storedModel = localStorage.getItem("selectedModel");
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
    if (storedModel) {
      setSelectedModel(storedModel); // Load the selected model from settings
    }
  }, []);

  // Fade-in effect for messages
  useEffect(() => {
    const timer = setTimeout(() => {
      setMessages((prevMessages) =>
        prevMessages.map((message, index) =>
          index === prevMessages.length - 1
            ? { ...message, visible: true }
            : message
        )
      );
    }, 50); // Delay for smooth fade-in effect
    return () => clearTimeout(timer);
  }, [messages]);

  const fetchResponse = async () => {
    if (!userInput.trim()) return; // Prevent empty input

    if (!apiKey) {
      setError("No API key found. Please set your API key in the settings.");
      triggerFadeOut();
      return;
    }

    setLoading(true);
    setError(null); // Reset error state
    setIsFading(false); // Reset fading state

    // Add the user's message to the messages array
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", content: userInput, visible: false },
    ]);

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`, // Use the saved API key here
          },
          body: JSON.stringify({
            model: selectedModel, // Use the model saved from settings
            messages: [
              { role: "system", content: "You are a helpful assistant." }, // System message
              { role: "user", content: userInput }, // User input
            ],
            max_tokens: 500, // Limit the tokens in the response
          }),
        }
      );

      const result = await response.json();

      // Check if result.choices exists and has at least one choice
      if (result.choices && result.choices.length > 0) {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            role: "assistant",
            content: result.choices[0].message.content,
            visible: false,
          }, // Add the assistant's response
        ]);
      } else {
        throw new Error("No choices found in the API response");
      }
    } catch (error) {
      setError(
        error.message || "Something went wrong while fetching the AI response."
      );
      triggerFadeOut();
    } finally {
      setLoading(false);
      setUserInput(""); // Clear the input field after submitting
    }
  };

  const triggerFadeOut = () => {
    setIsFading(false);
    setTimeout(() => {
      setIsFading(true);
      setTimeout(() => {
        setError(null); // Remove the alert after fading out
      }, 500); // Fade-out duration
    }, 3000); // Display the message for 3 seconds
  };

  return (
    <div className="relative min-h-screen p-8 pb-20 flex flex-col items-center justify-center">
      {/* Dropdown Menu in Top-Right Corner */}
      <div className="fixed top-0 right-0 p-4">
        <DropdownMenu>
          <DropdownMenuTrigger className="bg-black text-white px-3 py-2 rounded-md">
            Open
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>

            {/* Add the link to the settings page */}
            <DropdownMenuItem>
              <Link href="settings" passHref>
                API Key Settings
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuItem>Team</DropdownMenuItem>
            <DropdownMenuItem>Subscription</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <main className="flex flex-col gap-8 items-center sm:items-start w-full max-w-md">
        {/* Show an error alert if there is an error */}
        {error && (
          <Alert
            className={`mb-4 transition-opacity duration-500 ${
              isFading ? "opacity-0" : "opacity-100"
            }`}
          >
            <Terminal className="h-4 w-4" />
            <AlertTitle>Heads up!</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Render the cards for both user and assistant messages */}

        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-gray-500 text-lg">
            It's quiet here, huh? Type a question below to start...
          </div>
        )}

        <div className="flex flex-col gap-4 w-full">
          {messages.map((message, index) => (
            <Card
              key={index}
              className={`transition-opacity duration-500 ease-in-out ${
                message.visible ? "opacity-100" : "opacity-0"
              } ${
                message.role === "user"
                  ? "bg-white"
                  : selectedModel
                  ? "bg-black text-white"
                  : ""
              }`}
            >
              <CardContent className="p-4">
                {message.role === "user" ? (
                  <p>
                    <strong>User:</strong> {message.content}
                  </p>
                ) : (
                  <>
                    <ReactMarkdown
                      remarkPlugins={[remarkMath]} // For LaTeX in Markdown
                      rehypePlugins={[rehypeKatex, rehypeHighlight]} // For LaTeX rendering and code highlighting
                    >
                      {message.content}
                    </ReactMarkdown>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      {/* Input bar fixed at the bottom */}
      <div className="fixed bottom-0 left-0 w-full bg-white p-4 shadow-md">
        <div className="w-full max-w-md mb-4 px-4">
          <p className="text-sm text-gray-500 text-left">
            Selected Model:{" "}
            <span className="font-semibold">{selectedModel}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 max-w-md mx-auto w-full">
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            rows={1}
            className="flex-grow resize-none border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="Enter your message..."
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                fetchResponse();
              }
            }}
          />
          <button
            onClick={fetchResponse}
            className="bg-black text-white px-4 py-2 rounded-md"
            disabled={loading || !userInput.trim()}
          >
            {loading ? "Loading..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
