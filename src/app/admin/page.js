"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function AdminDashboard() {
  const [adminDetails, setAdminDetails] = useState({ username: "admin", email: "admin@example.com" });
  const [newPassword, setNewPassword] = useState("");
  const [quotes, setQuotes] = useState([]);
  const [comments, setComments] = useState([]);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const isAuthenticated = Cookies.get("isAuthenticated");
    if (!isAuthenticated) {
      router.push("/admin-login");
    } else {
      fetchQuotes();
      fetchComments();
      const timer = setTimeout(() => {
        handleLogout();
      }, 120000); // 2 minutes
      return () => clearTimeout(timer);
    }
  }, []);

  const fetchQuotes = async () => {
    try {
      const res = await fetch("/api/quotes", { method: "GET" });
      if (!res.ok) throw new Error("Failed to fetch quotes");
      const data = await res.json();
      setQuotes(data);
    } catch (error) {
      console.error("Error fetching quotes:", error);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await fetch("/api/comments", { method: "GET" });
      if (!res.ok) throw new Error("Failed to fetch comments");
      const data = await res.json();
      setComments(data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handlePasswordReset = async () => {
    if (!newPassword) return;
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });
      if (!res.ok) throw new Error("Failed to reset password");
      alert("Password reset successfully");
      setNewPassword("");
    } catch (error) {
      console.error("Error resetting password:", error);
      alert("Failed to reset password. Please try again.");
    }
  };

  const handleDeleteQuote = async (id) => {
    try {
      await fetch(`/api/quotes/${id}`, { method: "DELETE" });
      fetchQuotes();
    } catch (error) {
      console.error("Error deleting quote:", error);
      alert("Failed to delete quote. Please try again.");
    }
  };

  const handleDeleteComment = async (id) => {
    try {
      await fetch(`/api/comments/${id}`, { method: "DELETE" });
      fetchComments();
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Failed to delete comment. Please try again.");
    }
  };

  const handleQuoteClick = async (quote) => {
    const res = await fetch(`/api/comments?quote_id=${quote.quote_id}`, { method: "GET" });
    if (!res.ok) throw new Error("Failed to fetch comments");
    const comments = await res.json();
    setSelectedQuote({ ...quote, comments });
  };

  const handleDeleteCommentFromQuote = async (comment_id) => {
    try {
      await fetch(`/api/comments`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment_id }),
      });
      const updatedComments = selectedQuote.comments.filter(comment => comment.comment_id !== comment_id);
      setSelectedQuote({ ...selectedQuote, comments: updatedComments });
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Failed to delete comment. Please try again.");
    }
  };

  const handleLogout = () => {
    Cookies.remove("isAuthenticated");
    router.push("/");
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100 text-black">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">Admin Dashboard</h1>
        <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded-lg">Logout</button>
      </header>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">Admin Details</h2>
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <p className="text-lg font-semibold">Username: {adminDetails.username}</p>
          <p className="text-lg font-semibold">Email: {adminDetails.email}</p>
          <div className="mt-4">
            <input 
              type="password" 
              placeholder="New Password" 
              className="p-2 border rounded mb-2 w-full" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
            />
            <button onClick={handlePasswordReset} className="px-4 py-2 bg-blue-600 text-white rounded-lg w-full">Reset Password</button>
          </div>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">Quotes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quotes.map((q) => (
            <div key={q.quote_id} className="relative p-6 bg-white text-gray-900 rounded-lg shadow-lg border-l-4 border-yellow-400 transform hover:scale-105 transition duration-300">
              <p className="text-lg font-semibold  h-5">
                "{q.quote}"
              </p>
              <p className="text-sm text-gray-600 mt-10">- {q.writer} ({q.category || (q.categories.join(','))})</p>
              <div className="flex justify-between">
              <button onClick={() => handleDeleteQuote(q.quote_id)} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg">Delete Quote</button>
              <button className="font-semibold cursor-pointer mt-4 px-4 py-2"  onClick={() => handleQuoteClick(q)}>Comments</button>
              </div>
              
              <div className="absolute top-0 right-0 mt-2 mr-2 p-2 bg-gray-200 rounded-lg shadow-lg text-black">
               
                <ul className="text-sm max-h-40 overflow-y-auto">
                  {(q.comments || []).map((comment, index) => (
                    <li key={index} className="border-b py-1">{comment.comment}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {selectedQuote && (
        <div className="fixed inset-0 flex items-center justify-center bg-amber-50/[.5]">
          <div className="bg-white text-black p-6 rounded-lg shadow-lg max-w-lg w-full">
            <h2 className="text-xl font-bold">{selectedQuote.quote}</h2>
            <p className="text-sm text-gray-600 mt-2">- {selectedQuote.writer} ({selectedQuote.category})</p>
            <h3 className="mt-4 font-semibold">Comments:</h3>
            <ul className="mt-2 text-sm text-gray-700 max-h-40 overflow-y-auto">
              {(selectedQuote.comments || []).map((comment, index) => (
                <li key={index} className="border-b py-1 flex justify-between items-center">
                  <span>{comment.comment}</span>
                  <button onClick={() => handleDeleteCommentFromQuote(comment.comment_id)} className="px-2 py-1 bg-red-600 text-white rounded-lg">Delete</button>
                </li>
              ))}
            </ul>
            <button onClick={() => setSelectedQuote(null)} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg">Close</button>
          </div>
        </div>
      )}

      
    </div>
  );
}
