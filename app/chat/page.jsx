import { Suspense } from "react";
import ChatPageContent from "@/components/chat-page-content";

// ✅ Metadata for this page
export const metadata = {
  title: "Chat with Meera Clinic Assistant",
  description:
    "Talk to Meera Clinic’s AI-powered assistant. Book appointments, check doctor availability, and get instant help.",
  openGraph: {
    title: "Chat with Meera Clinic Assistant",
    description:
      "AI receptionist for Meera Clinic — available 24/7 to help you with bookings and doctor queries.",
    url: "https://meeraclinic.vercel.app/chat",
    siteName: "Meera Clinic",
    images: [
      {
        url: "/chat-preview.png", // put a banner in /public
        width: 1200,
        height: 630,
        alt: "Chat with Meera Clinic Assistant",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Chat with Meera Clinic Assistant",
    description:
      "Book appointments & check doctor availability instantly with Meera Clinic AI assistant.",
    images: ["/chat-preview.png"],
    creator: "@thefstack",
  },
};

function ChatPageLoading() {
  return (
    <div className="h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-gray-600">Loading chat...</p>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<ChatPageLoading />}>
      <ChatPageContent />
    </Suspense>
  );
}
