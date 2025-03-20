"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { FaUserShield, FaThumbsUp, FaThumbsDown, FaSearch, FaComment, FaPen } from "react-icons/fa";


const predefinedCategories = ["Life", "Humor", "Inspiration", "Wisdom", "Motivation", "Love"];

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [quotes, setQuotes] = useState([]);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [currentComments, setCurrentComments] = useState({});
  const [showWritePopup, setShowWritePopup] = useState(false);
  const [newQuote, setNewQuote] = useState({ writer: "", categories: [], customCategory: "", quote: "" });
  const [userInteractions, setUserInteractions] = useState({});
  const router = useRouter();

  useEffect(() => {
    fetchQuotes();
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

  const handleCategoryChange = (category) => {
    setNewQuote((prev) => {
      const categories = prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category];
      return { ...prev, categories };
    });
  };

  const handleAddQuote = async () => {
    if (!newQuote.writer || !newQuote.quote || newQuote.categories.length === 0) return;
    await fetch(`/api/quotes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newQuote),
    });
    setNewQuote({ writer: "", categories: [], customCategory: "", quote: "" });
    setShowWritePopup(false);
    fetchQuotes();
  };

  const handleLike = async (id) => {
    if (userInteractions[id] === 'liked') return;
    const newInteractions = { 
      ...userInteractions, 
      [id]: 'liked' 
    };
    if (userInteractions[id] === 'disliked') {
      newInteractions[id] = 'liked';
    }
    setUserInteractions(newInteractions);
    try {
      const res = await fetch(`/api/like`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: id }),
      });
      if (!res.ok) throw new Error(`Failed to like quote with id ${id}`);
      const updatedQuotes = quotes.map(quote => 
        quote.quote_id === id ? { ...quote, likes: quote.likes + 1, dislikes: quote.dislikes - (userInteractions[id] === 'disliked' ? 1 : 0) } : quote
      );
      setQuotes(updatedQuotes);
    } catch (error) {
      console.error("Error liking quote:", error);
    }
  };

  const handleDislike = async (id) => {
    if (userInteractions[id] === 'disliked') return;
    const newInteractions = { 
      ...userInteractions, 
      [id]: 'disliked' 
    };
    if (userInteractions[id] === 'liked') {
      newInteractions[id] = 'disliked';
    }
    setUserInteractions(newInteractions);
    try {
      const res = await fetch(`/api/dislike`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: id }),
      });
      if (!res.ok) throw new Error(`Failed to dislike quote with id ${id}`);
      const updatedQuotes = quotes.map(quote => 
        quote.quote_id === id ? { ...quote, dislikes: quote.dislikes + 1, likes: quote.likes - (userInteractions[id] === 'liked' ? 1 : 0) } : quote
      );
      setQuotes(updatedQuotes);
    } catch (error) {
      console.error("Error disliking quote:", error);
    }
  };

  const handleAddComment = async (id) => {
    if (!currentComments[id]) return;
    try {
      const res = await fetch(`/api/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quote_id: id, comment: currentComments[id] }),
      });
      if (!res.ok) throw new Error("Failed to add comment");
      setCurrentComments({ ...currentComments, [id]: "" });
      fetchQuotes();
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const filteredQuotes = quotes.filter(q =>
    q.quote.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.writer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen p-6 bg-gradient-to-r from-blue-400 to-purple-500 text-white">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-yellow-300">QuoteStation</h1>
        <div className="flex gap-4">
          <button onClick={() => setShowWritePopup(true)} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md shadow-lg">
            <FaPen /> Write Quote
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md shadow-lg" onClick={()=> router.push("/admin-login")}>
            <FaUserShield /> Admin Login
          </button>
        </div>
      </header>

      <div className="relative w-full mb-6">
        <input 
          type="text" 
          placeholder="Search quotes..." 
          className="w-full p-3 pl-10 rounded-lg text-black border focus:outline-none focus:ring-2 focus:ring-yellow-400" 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FaSearch className="absolute left-3 top-3 text-gray-600" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredQuotes.map((q) => (
          <div key={q.quote_id} className="p-6 bg-white text-gray-900 rounded-lg shadow-lg border-l-4 border-yellow-400 transform hover:scale-105 transition duration-300">
            <p className="text-lg font-semibold cursor-pointer h-5" onClick={() => setSelectedQuote(q)}>
            &quot;{q.quote}&quot;
            </p>
            <p className="text-sm text-gray-600 mt-10">- {q.writer} ({q.category || (q.categories.join(','))})</p>
            <div className="flex items-center gap-4 mt-4">
              <button 
                onClick={() => handleLike(q.quote_id)} 
                className={`flex items-center gap-2 ${userInteractions[q.quote_id] === 'liked' ? 'text-green-600' : 'text-green-800 hover:text-green-600'}`}
              >
                <FaThumbsUp /> {q.likes}
              </button>
              <button 
                onClick={() => handleDislike(q.quote_id)} 
                className={`flex items-center gap-2 ${userInteractions[q.quote_id] === 'disliked' ? 'text-red-600' : 'text-red-800 hover:text-red-600'}`}
              >
                <FaThumbsDown /> {q.dislikes}
              </button>
            </div>
            <div className="mt-4">
              <input 
                type="text" 
                placeholder="Add a comment..." 
                className="w-full p-2 border rounded"
                value={currentComments[q.quote_id] || ""}
                onChange={(e) => setCurrentComments({ ...currentComments, [q.quote_id]: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment(q.quote_id)}
              />
            </div>
          </div>
        ))}
      </div>

      {selectedQuote && (
        <div className="fixed inset-0 flex items-center justify-center bg-amber-50/[.5]">
          <div className="bg-white text-black p-6 rounded-lg shadow-lg max-w-lg w-full">
            <h2 className="text-xl font-bold">{selectedQuote.quote}</h2>
            <p className="text-sm text-gray-600 mt-2">- {selectedQuote.writer} ({selectedQuote.category})</p>
            <h3 className="mt-4 font-semibold">Comments:</h3>
            <ul className="mt-2 text-sm text-gray-700 max-h-40 overflow-y-auto">
              {(selectedQuote.comments || []).map((comment, index) => (
                <li key={index} className="border-b py-1">{comment}</li>
              ))}
            </ul>
            <button onClick={() => setSelectedQuote(null)} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg">Close</button>
          </div>
        </div>
      )}
      {showWritePopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-amber-50/[.5] transition-opacity duration-3000 ease-in-out">
          <div className="bg-white text-black p-6 rounded-lg shadow-lg max-w-lg w-full transform transition-transform duration-300 ease-in-out scale-95">
            <h2 className="text-xl font-bold mb-4">Write a Quote</h2>
            <input type="text" placeholder="Writer Name" className="w-full p-2 border rounded mb-2" value={newQuote.writer} onChange={(e) => setNewQuote({ ...newQuote, writer: e.target.value })} />
            <div className="mb-2">
              <p className="font-semibold">Select Category:</p>
              <div className="flex flex-wrap gap-2">
                {predefinedCategories.map((cat) => (
                  <button key={cat} onClick={() => handleCategoryChange(cat)} className={`px-3 py-1 rounded ${newQuote.categories.includes(cat) ? "bg-blue-600 text-white" : "bg-gray-300 text-black"}`}>
                    {cat}
                  </button>
                ))}
              </div>
              <input type="text" placeholder="Custom Category" className="w-full p-2 border rounded mt-2" value={newQuote.customCategory} onChange={(e) => setNewQuote({ ...newQuote, customCategory: e.target.value })} />
            </div>
            <textarea placeholder="Enter quote..." className="w-full p-2 border rounded mb-2" value={newQuote.quote} onChange={(e) => setNewQuote({ ...newQuote, quote: e.target.value })} />
            <button onClick={handleAddQuote} className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg">Submit</button>
            <button onClick={() => setShowWritePopup(false)} className="mt-2 ml-2 px-4 py-2 bg-red-600 text-white rounded-lg">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
