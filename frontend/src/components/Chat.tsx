import { useEffect, useRef, useState } from "react";
import { FiSend } from "react-icons/fi";
import { BsChevronDown, BsPlusLg } from "react-icons/bs";
import { RxHamburgerMenu } from "react-icons/rx";
import useAutoResizeTextArea from "../hooks/useAutoResizeTextArea";
import Message from "./Message";
import { DEFAULT_OPENAI_MODEL } from "../shared/Constants";
import { useSession } from "next-auth/react";
import {sendPrompt, sendSubmission, sendUserID} from "../utils/helpers";



function getMessageForLevel(conversationLevel: String): String {
  if (conversationLevel === "profile") {
    return "Please share your personal info like Name, DOB, Email, phone";
  } else if (conversationLevel === "family") {
    return "Please share your family info like Father's Name, Mother's Name, Siblings, etc.";
  } else if (conversationLevel === "address") {
    return "Please share your address info like Address, City, State, etc.";
  } else if (conversationLevel === "profession") {
    return "Please share your profession info like Education, Work Experience, etc.";
  }
  return "";
}

const Chat = () => {
  const toggleComponentVisibility = true;
  const InitiatliseChat = "Hello! I'm Sidekick.ai, your personal AI form filling assistant. I can help you fill out forms, answer questions, and more. \n Let's start. Please share your personal info like Name, DOB, Email, phone"
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showEmptyChat, setShowEmptyChat] = useState(false);
  const [conversation, setConversation] = useState<any[]>([ { content: InitiatliseChat, role: "system" }]);
  const [message, setMessage] = useState("");
  const textAreaRef = useAutoResizeTextArea();
  const bottomOfChatRef = useRef<HTMLDivElement>(null);

  // 0 -> set profile
  // 1 -> set family
  // 2 -> set address
  // 3 -> set credentials
  const [conversationLevel, setConversationLevel] = useState("profile");

  const { data: session, status } = useSession()

  const selectedModel = DEFAULT_OPENAI_MODEL;

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "24px";
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, [message, textAreaRef]);


  useEffect(() => {
    sendUserID(session?.user?.name?.toString() ?? "")
  }, [session])

  useEffect(() => {
    if (bottomOfChatRef.current) {
      bottomOfChatRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversation]);

  const sendMessage = async (e: any) => {
    e.preventDefault();

    // Don't send empty messages
    if (message.length < 1) {
      setErrorMessage("Please enter a message.");
      return;
    } else {
      setErrorMessage("");
    }

    setIsLoading(true);

    // Add the message to the conversation
    setConversation((prevValue: any) => [
      ...prevValue,
      { content: message, role: "user" },
    ]);

    // Clear the message & remove empty chat
    setMessage("");
    setShowEmptyChat(false);

    try {

      let response = await sendPrompt(
          session?.user?.name?.toString() ?? "",
          conversationLevel,
          message);

      if (response !== undefined) {
        setConversation((prevValue: any) => [
          ...prevValue,
          { content: response.message, role: "system" },
        ]);

        if(conversationLevel == "profession") {
          let response = await sendSubmission(session?.user?.name?.toString() ?? "");
          console.log(response, "form submitteddd ");
        }

      } else {
        console.error(response);
      }

    if (conversationLevel === "profile") {
      setConversationLevel("family");
      setConversation((prevValue: any) => [
        ...prevValue,
        { content: getMessageForLevel("family"), role: "system" },
      ]);
    } else if (conversationLevel === "family") {
      setConversationLevel("address");
      setConversation((prevValue: any) => [
        ...prevValue,
        { content: getMessageForLevel("address"), role: "system" },
      ]);
    } else if (conversationLevel === "address") {
      setConversationLevel("profession");
      setConversation((prevValue: any) => [
        ...prevValue,
        { content: getMessageForLevel("profession"), role: "system" },
      ]);
    }

    setIsLoading(false);
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message);

      setIsLoading(false);
    }
  };

  const handleKeypress = (e: any) => {
    // It's triggers by pressing the enter key
    if (e.keyCode == 13 && !e.shiftKey) {
      sendMessage(e);
      e.preventDefault();
    }
  };

  return (
    <div className="h-[calc(100vh-70px)] flex max-w-full flex-1 flex-col">
      <div className="sticky top-0 z-10 flex items-center border-b border-white/20 bg-[#171717] pl-1 pt-1 text-gray-200 sm:pl-3 md:hidden">
        <h1 className="flex-1 text-center text-base font-normal">New chat</h1>
        <button type="button" className="px-3">
          <BsPlusLg className="h-6 w-6" />
        </button>
      </div>
      <div className="relative h-full w-full transition-width flex flex-col overflow-hidden items-stretch flex-1">
        <div className="flex-1 overflow-hidden">
          <div className="react-scroll-to-bottom--css-ikyem-79elbk h-full dark:bg-[#171717]">
            <div className="react-scroll-to-bottom--css-ikyem-1n7m0yu">
              {!showEmptyChat && conversation.length > 0 ? (
                <div className="flex flex-col items-center text-sm bg-[#171717]">
                  
                  {conversation.map((message, index) => (
                    <Message key={index} message={message} />
                  ))}
                  <div className="w-full h-32 md:h-48 flex-shrink-0"></div>
                  <div ref={bottomOfChatRef}></div>
                </div>
              ) : null}
              {showEmptyChat ? (
                <div className="py-10 relative w-full flex flex-col h-full">
                  <div className="flex items-center justify-center gap-2">
                    {/* <div className="relative w-full md:w-1/2 lg:w-1/3 xl:w-1/4">
                      <button
                        className="relative flex w-full cursor-default flex-col rounded-md border border-black/10 bg-white py-2 pl-3 pr-10 text-left focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:border-white/20 dark:bg-[#171717] sm:text-sm align-center"
                        id="headlessui-listbox-button-:r0:"
                        type="button"
                        aria-haspopup="true"
                        aria-expanded="false"
                        data-headlessui-state=""
                        aria-labelledby="headlessui-listbox-label-:r1: headlessui-listbox-button-:r0:"
                      >
                        <label
                          className="block text-xs text-gray-700 dark:text-gray-500 text-center"
                          id="headlessui-listbox-label-:r1:"
                          data-headlessui-state=""
                        >
                          Model
                        </label>
                        <span className="inline-flex w-full truncate">
                          <span className="flex h-6 items-center gap-1 truncate text-white">
                            {selectedModel.name}
                          </span>
                        </span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                          <BsChevronDown className="h-4 w-4 text-gray-400" />
                        </span>
                      </button>
                    </div> */}
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-semibold text-center text-gray-200 dark:text-gray-600 flex gap-2 items-center justify-center h-screen">
                    Sidekick.ai
                  </h1>
                </div>
              ) : null}
              <div className="flex flex-col items-center text-sm dark:bg-[#171717]"></div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full border-t md:border-t-0 dark:border-white/20 md:border-transparent md:dark:border-transparent md:bg-vert-light-gradient bg-white dark:bg-[#171717] md:!bg-transparent dark:md:bg-vert-dark-gradient pt-2">
          <form className="stretch mx-2 flex flex-row gap-3 last:mb-2 md:mx-4 md:last:mb-6 lg:mx-auto lg:max-w-2xl xl:max-w-3xl">
            <div className="relative flex flex-col h-full flex-1 items-stretch md:flex-col">
              {errorMessage ? (
                <div className="mb-2 md:mb-0">
                  <div className="h-full flex ml-1 md:w-full md:m-auto md:mb-2 gap-0 md:gap-2 justify-center">
                    <span className="text-red-500 text-sm">{errorMessage}</span>
                  </div>
                </div>
              ) : null}
              <div className="flex flex-col w-full py-2 flex-grow md:py-3 md:pl-4 relative border border-black/10 bg-white dark:border-gray-900/50 dark:text-white dark:bg-gray-700 rounded-md shadow-[0_0_10px_rgba(0,0,0,0.10)] dark:shadow-[0_0_15px_rgba(0,0,0,0.10)]">
                <textarea
                  ref={textAreaRef}
                  value={message}
                  tabIndex={0}
                  data-id="root"
                  style={{
                    height: "24px",
                    maxHeight: "200px",
                    overflowY: "hidden",
                  }}
                  // rows={1}
                  placeholder="Send a message..."
                  className="m-0 w-full resize-none border-0 bg-transparent p-0 pr-7 focus:ring-0 focus-visible:ring-0 dark:bg-transparent pl-2 md:pl-0"
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeypress}
                ></textarea>
                <button
                  disabled={isLoading || message?.length === 0}
                  onClick={sendMessage}
                  className="absolute p-1 rounded-md bottom-1.5 md:bottom-2.5 bg-transparent disabled:bg-[#202020]0 right-1 md:right-2 disabled:opacity-40"
                >
                  <FiSend className="h-4 w-4 mr-1 text-white " />
                </button>
              </div>
            </div>
          </form>
          <div className="px-3 pt-2 pb-3 text-center text-xs text-black/50 dark:text-white/50 md:px-4 md:pt-3 md:pb-6">
            <span>
              Your data is always safe, because it's never stored!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
