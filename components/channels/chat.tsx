"use client";

import React, { useEffect, useState } from "react";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { useSession } from "@/hooks/useSession";
import { Textarea } from "../ui/textarea";
import { Bars3BottomLeftIcon } from "@heroicons/react/24/solid";
import { socket } from "@/lib/socket";

type Message = {
  username: string;
  msg: string;
  isAdmin: boolean;
};

function MessageBox({ message }: { message: Message }) {
  return (
    <div className="rounded-md my-1 px-1">
      <span>{message.isAdmin ? "" : `${message.username}: `}</span>
      <span className={message.isAdmin ? "text-gray-500" : ""}>
        {message.msg}
      </span>
    </div>
  );
}

export default function Chat({
  room,
  setCloseChat,
}: {
  room: string;
  setCloseChat: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  // TODO: restrict amount of messages

  const [messages, setMessages] = useState<Message[]>([
    { username: "admin", msg: "Welcome to the chat!", isAdmin: true },
  ]);
  const [currentMessage, setCurrentMessage] = useState("");
  const { session } = useSession();

  useEffect(() => {
    socket.on("chatting_enter", (userid: string) => {
      setMessages((prev) => [
        ...prev,
        {
          username: "admin",
          msg: `${userid} joined the chat!`,
          isAdmin: true,
        },
      ]);
    });

    socket.on(
      "new_message",
      (msg: string, userid: string, username: string) => {
        setMessages((prev) => [...prev, { username, msg, isAdmin: false }]);
      }
    );

    return () => {
      socket.off("chatting_enter");
      socket.off("new_message");
    };
  }, []);

  function submitMessage() {
    socket.emit("send_message", currentMessage, room, () => {
      setMessages((prev) => [
        ...prev,
        {
          username: session!.user.username,
          msg: currentMessage,
          isAdmin: false,
        },
      ]);
    });
    setCurrentMessage("");
  }

  function handleOnKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter") {
      if (e.shiftKey) {
        return;
      }
      e.preventDefault();
      submitMessage();
    }
  }

  return (
    <>
      <div className="relative">
        <Bars3BottomLeftIcon
          className="absolute top-3 left-3 h-6 w-6 cursor-pointer"
          onClick={() => setCloseChat(true)}
        />
        <h1 className="text-lg text-center border-b py-2">STREAM CHAT</h1>
      </div>
      <div className="flex-1 flex flex-col-reverse p-3">
        <div>
          {messages.map((message, index) => (
            <MessageBox key={index} message={message} />
          ))}
        </div>
      </div>
      <div className="flex flex-col p-3">
        <Label htmlFor="msg" />
        <div className="grid w-full gap-2">
          <Textarea
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyDown={handleOnKeyDown}
            className="min-h-0 resize-none"
            placeholder="Type your message here"
            id="msg"
          />
          <Button
            size="sm"
            className="bg-kookmin dark:text-white"
            onClick={submitMessage}
          >
            Send
          </Button>
        </div>
      </div>
    </>
  );
}
