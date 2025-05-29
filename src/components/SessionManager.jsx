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
              <svg
                width="215.39307556152343"
                height="50.626132567226996"
                viewBox="0 0 383.8999938964844 90.23211137541728"
                className="looka-1j8o68f cursor-pointer"
              >
                <defs id="SvgjsDefs4865"></defs>
                <g
                  id="SvgjsG4866"
                  featurekey="symbolFeature-0"
                  transform="matrix(0.6898787855261039,0,0,0.6898787855261039,-13.310095387583845,-2.90760899534669)"
                  fill="#000000"
                >
                  <path
                    xmlns="http://www.w3.org/2000/svg"
                    d="M96.63 57.12q11.83 7.36 23.98 14.42c4.75 2.76 4.29 5.89-.18 8.46q-3.3 1.89-6.48 3.64-.8.44-.02.91l6.97 4.19a4.64 4.63-74.5 0 1 2.24 3.97v17.42a4.2 4.2 0 0 1-2.05 3.61q-10.37 6.18-21.01 12.58c-2.5 1.51-3.82 1.71-6.39.13q-13.16-8.08-21.94-13.31a.63.63 0 0 0-.64 0l-23.23 13.88a4.18 4.15 45 0 1-4.27-.01l-21.55-12.96a3.87 3.86 15.6 0 1-1.87-3.31q.01-11.33-.01-17.49-.02-3.31 2.55-4.76 3.07-1.73 6.62-4.05a.31.31 0 0 0-.02-.53q-6.07-3.54-8.62-5.19-1.57-1.02-1.4-3.41c.15-1.92 1.7-2.78 3.31-3.74q9.73-5.76 23.85-14.27.46-.28.16-.73c-.49-.73-1.02-1.43-1.03-2.51q-.02-17.99.01-25.14a4.73 4.72 74.6 0 1 2.28-4.03q9.96-5.99 20.84-12.4 2.97-1.75 5.04-.52 15.95 9.45 20.69 12.07 3.17 1.74 3.2 4.7.1 12.03-.04 25.02-.01.82-1.17 2.58-.31.48.18.78m-25.56-12.7q.53-2.61 2.69-3.93 5.89-3.61 17.45-11.03a.31.31 0 0 0-.01-.53L72.17 17.49a.79.79 0 0 0-.82 0L52.33 28.85a1.95 1.95 0 0 0-.94 1.67v22.29a2.23 2.22 15.7 0 0 1.07 1.9l18.03 10.84a.36.35-74.5 0 0 .54-.31l.02-20.56a1.77 1.64-42.8 0 1 .02-.26m26.42 28.32c2.06 1.44 2.23 4.4-.02 5.75Q79.09 89.54 73.35 92.96a3.74 3.72 44.9 0 1-3.83-.01Q59.11 86.71 47.76 79.7c-1.31-.81-2.87-1.56-3.41-2.97-.87-2.26.63-3.76 2.48-4.89q5.13-3.1 11.23-6.78a.16.16 0 0 0 0-.27l-6.3-3.78q-.24-.15-.48 0L27.46 75.24a.47.47 0 0 0-.01.81l43.38 26.09a1.14 1.12 44.6 0 0 1.15 0l43.89-26.22a.3.3 0 0 0 0-.52L91.29 60.62q-.17-.11-.34 0l-6.4 3.82a.18.17 44 0 0 .01.3q8.83 5.14 12.93 8m-32 11.01q0 .18.08.23 2.9 1.66 5.73 3.44.01.01.14.02.06.01.12.01t.12-.01q.13-.01.14-.02 2.83-1.78 5.73-3.44.07-.05.07-.23t-.07-.23q-2.9-1.66-5.73-3.44-.01-.01-.14-.02-.06-.01-.12-.01t-.12.01q-.13.01-.14.02-2.83 1.78-5.73 3.44-.08.05-.08.23M45.6 121.56a.35.35 0 0 0 .36 0l22.62-13.51a.35.35 0 0 0 0-.6l-19.1-11.48a.35.35 0 0 0-.36 0l-22.62 13.5a.35.35 0 0 0 0 .6zm70.54-11.46a.34.34 0 0 0 0-.58L93.65 95.99a.34.34 0 0 0-.34 0l-19.13 11.43a.34.34 0 0 0 0 .58l22.49 13.53a.34.34 0 0 0 .34 0z"
                  ></path>
                </g>
              </svg>
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
