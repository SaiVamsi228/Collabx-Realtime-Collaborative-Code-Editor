import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBolt,
  faGlobe,
  faLock,
  faArrowRight,
  faUnlockAlt,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import { auth, db } from "../firebase.js";
import { signOut } from "firebase/auth";
import { doc, setDoc, collection, onSnapshot } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";

function SessionManager() {
  const [activeTab, setActiveTab] = useState("public");
  const [sessions, setSessions] = useState([]);
  const [newSessionName, setNewSessionName] = useState("");
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        navigate("/");
        return;
      }

      const unsubscribeSnapshot = onSnapshot(
        collection(db, "sessions"),
        (snapshot) => {
          const sessionList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setSessions(sessionList);
        },
        (err) => {
          console.error("Firestore listener error:", err);
        }
      );

      return () => unsubscribeSnapshot();
    });

    return () => unsubscribeAuth();
  }, [navigate]);

  const createSession = async () => {
    if (!newSessionName || !user) return;
    try {
      setError(null);
      const sessionId = `${user.uid}-${Date.now()}`;
      const sessionData = {
        name: newSessionName,
        creatorId: user.uid,
        creatorUsername: user.displayName || "Anonymous",
        participants: [
          { uid: user.uid, username: user.displayName || "Anonymous" },
        ],
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, "sessions", sessionId), sessionData);
      setNewSessionName("");
      navigate(`/session/${sessionId}`);
    } catch (err) {
      setError("Failed to create session: " + err.message);
    }
  };

  const joinSession = async (sessionId) => {
    if (!user) {
      setError("You must be logged in to join a session.");
      return;
    }
    try {
      setError(null);
      const sessionRef = doc(db, "sessions", sessionId);
      const currentSession = sessions.find((s) => s.id === sessionId);
      if (!currentSession) throw new Error("Session not found");

      if (!currentSession.participants.some((p) => p.uid === user.uid)) {
        const updatedParticipants = [
          ...currentSession.participants,
          { uid: user.uid, username: user.displayName || "Anonymous" },
        ];
        await setDoc(
          sessionRef,
          { participants: updatedParticipants },
          { merge: true }
        );
      }
      navigate(`/session/${sessionId}`);
    } catch (err) {
      setError("Failed to join session: " + err.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      setError("Error signing out: " + error.message);
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="bg-white min-h-screen">
      <div className="fixed top-0 left-0 right-0 bg-white shadow-sm z-10">
        <header className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/">
              <img
                src="./MY-FULL-LOGO.svg"
                alt="CollabX Logo"
                className="w-[215px] h-[50px] cursor-pointer"
              />
            </Link>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 border-2 font-bold border-black text-black rounded-xl hover:bg-black hover:text-white transition-all"
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="text-xs" />
            <span>Logout</span>
          </button>
        </header>

        <div className="container mx-auto px-6 pb-6">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-4 mb-6">
              <input
                type="text"
                className="flex-1 px-5 py-3 border border-gray-200 rounded-lg text-base focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                placeholder="Name your session"
                value={newSessionName}
                onChange={(e) => setNewSessionName(e.target.value)}
              />
              <button
                onClick={createSession}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-900 text-white font-semibold rounded-lg hover:bg-gray-100 hover:text-black hover:border-black border border-transparent transition-all"
              >
                <FontAwesomeIcon icon={faBolt} className="text-sm" />
                <span>Launch</span>
              </button>
            </div>
            {error && <p className="text-red-500 text-base">{error}</p>}
          </div>
        </div>
      </div>

      <div className="pt-40 px-6 pb-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white p-8 rounded-lg border border-gray-200">
            <div className="flex gap-3 mb-8 bg-gray-100 p-1 rounded-lg">
              <button
                className={`flex-1 py-4 font-semibold rounded-md text-base transition-all ${
                  activeTab === "public"
                    ? "bg-indigo-900 text-white shadow-sm"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
                onClick={() => setActiveTab("public")}
              >
                <FontAwesomeIcon icon={faGlobe} className="mr-2" />
                Public
              </button>
              <button
                className={`flex-1 py-4 font-semibold rounded-md text-base transition-all ${
                  activeTab === "private"
                    ? "bg-indigo-900 text-white shadow-sm"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
                onClick={() => setActiveTab("private")}
              >
                <FontAwesomeIcon icon={faLock} className="mr-2" />
                Private
              </button>
            </div>

            {activeTab === "public" ? (
              <div className="max-h-[70vh] overflow-y-auto pr-4">
                {sessions.length ? (
                  sessions.map((session) => (
                    <div
                      key={session.id}
                      className="bg-white p-6 rounded-md border border-gray-200 hover:-translate-y-0.5 hover:shadow-md transition-all mb-4"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {session.name}
                          </h3>
                          <p className="text-base text-gray-500">
                            by {session.creatorUsername} •{" "}
                            {session.participants.length} participants
                          </p>
                        </div>
                        <button
                          onClick={() => joinSession(session.id)}
                          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-900 text-white font-semibold rounded-lg hover:bg-gray-100 hover:text-black hover:border-black border border-transparent transition-all"
                        >
                          <FontAwesomeIcon
                            icon={faArrowRight}
                            className="text-sm"
                          />
                          <span>
                            {session.participants.some(
                              (p) => p.uid === user?.uid
                            )
                              ? "Rejoin"
                              : "Join"}
                          </span>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-base text-gray-500">
                    No sessions yet. Create one!
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-base text-gray-700 mb-2">
                    Room ID
                  </label>
                  <input
                    type="text"
                    className="w-full px-5 py-3 border border-gray-200 rounded-lg text-base focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                    placeholder="Enter Room ID"
                  />
                </div>
                <div>
                  <label className="block text-base text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    className="w-full px-5 py-3 border border-gray-200 rounded-lg text-base focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                    placeholder="Enter Password"
                  />
                </div>
                <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-900 text-white font-semibold rounded-lg hover:bg-gray-100 hover:text-black hover:border-black border border-transparent transition-all">
                  <FontAwesomeIcon icon={faUnlockAlt} />
                  <span>Access Room</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SessionManager;
