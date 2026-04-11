import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Camera, User, Lock, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Settings() {
    const navigate = useNavigate();

    const [user, setUser] = useState({});
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [photo, setPhoto] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    // ✅ LOAD USER FROM TOKEN (FAST)
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem("token") || sessionStorage.getItem("token");

                if (!token) {
                    navigate("/login");
                    return;
                }

                const res = await fetch("http://localhost:5000/api/auth/me", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) {
                    throw new Error("Failed to fetch user");
                }

                const data = await res.json();

                setName(data.name || "");
                setEmail(data.email || "");
                setPreview(data.photo || null);

            } catch (err) {
                console.error(err);
                toast.error("Failed to load user");
            }
        };

        fetchUser();
    }, []);

    // ✅ HANDLE IMAGE
    const handlePhotoChange = (file) => {
        setPhoto(file);
        if (file) {
            setPreview(URL.createObjectURL(file));
        }
    };

    // ✅ UPDATE PROFILE
    const handleUpdate = async () => {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        console.log("TOKEN:", token);
        if (!token) {
            toast.error("Session expired. Please login again.");
            navigate("/login");
            return;
        }

        try {
            setLoading(true);

            const formData = new FormData();
            if (name) formData.append("name", name);
            if (email) formData.append("email", email);
            if (password) formData.append("password", password);
            if (photo) formData.append("photo", photo);

            const res = await fetch("http://localhost:5000/api/auth/update-profile", {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            let data;
            try {
                data = await res.json();
            } catch {
                throw new Error("Invalid server response");
            }

            if (res.ok) {
                toast.success("Profile updated successfully 🚀");

                // ✅ Update localStorage
                if (data.user?.photo) {
                    const imageUrl = `http://localhost:5000/${data.user.photo}`;
                    localStorage.setItem("userPhoto", imageUrl);
                    setPreview(imageUrl);
                }

                if (data.user?.name) {
                    localStorage.setItem("userName", data.user.name);
                }

                setTimeout(() => navigate("/home"), 1000);
            }

        } catch (err) {
            console.error(err);
            toast.error("Server error. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="app-shell min-h-screen">
        <div className="page-frame flex min-h-[calc(100dvh-2rem)] items-center justify-center py-8 sm:py-12">

            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-3xl rounded-3xl border bg-white/80 p-6 shadow-2xl backdrop-blur-xl sm:p-8"
            >

                {/* 🔙 BACK BUTTON */}
                <button
                    onClick={() => navigate("/home")}
                    className="mb-6 text-sm px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
                >
                    ← Back to Home
                </button>

                {/* HEADER */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl">
                        <User />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">Account Settings</h2>
                        <p className="text-sm text-gray-500">Manage your profile</p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-center">

                    {/* AVATAR */}
                    <div className="flex flex-col items-center">
                        <div className="relative group">
                            <img
                                src={
                                    preview || `https://ui-avatars.com/api/?name=${name}`
                                }
                                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                            />

                            <label className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center text-white cursor-pointer transition">
                                <Camera />
                                <input
                                    type="file"
                                    hidden
                                    onChange={(e) => handlePhotoChange(e.target.files[0])}
                                />
                            </label>
                        </div>

                        <p className="text-sm text-gray-500 mt-2">
                            Click to change photo
                        </p>
                    </div>

                    {/* FORM */}
                    <div className="flex-1 w-full space-y-5">

                        <div className="relative">
                            <User className="absolute top-3 left-3 text-gray-400" size={18} />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Full Name"
                                className="w-full pl-10 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-purple-400 outline-none"
                            />
                        </div>

                        <div className="relative">
                            <Mail className="absolute top-3 left-3 text-gray-400" size={18} />
                            <input
                                type="email"
                                value={email}
                                disabled
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-100 text-gray-500"
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute top-3 left-3 text-gray-400" size={18} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="New Password"
                                className="w-full pl-10 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-purple-400 outline-none"
                            />
                        </div>

                        {/* SAVE BUTTON */}
                        <button
                            onClick={handleUpdate}
                            disabled={loading}
                            className={`w-full py-3 rounded-xl text-white font-semibold shadow-lg transition
                            ${loading
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-gradient-to-r from-purple-600 to-pink-500 hover:scale-105"
                                }`}
                        >
                            {loading ? "Saving..." : "💾 Save Changes"}
                        </button>
                    </div>
                </div>

            </motion.div>
        </div>
        </div>
    );
}
