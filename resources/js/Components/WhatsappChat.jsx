import React, { useState, useEffect, useRef } from "react";
import { useForm } from "@inertiajs/react";
import {
    Send,
    Paperclip,
    User,
    Search,
    CheckCheck,
    Phone,
    Trash2,
    X,
    MessageCircle,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function WhatsappChat({
    contacts = [],
    selectedContact = null,
    onSelectContact = () => {},
    connection = { status: "offline" },
}) {
    const [messages, setMessages] = useState([]);
    const [groupedMessages, setGroupedMessages] = useState({});
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [messageToDelete, setMessageToDelete] = useState(null);
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);
    const { data, setData, post, processing, reset } = useForm({
        phone: "",
        message: "",
    });

    useEffect(() => {
        if (selectedContact) {
            setData("phone", selectedContact.phone);
            loadMessages(selectedContact.phone);
            markMessagesAsRead(selectedContact.id);
        }
    }, [selectedContact]);

    useEffect(() => {
        if (scrollRef.current && messages.length > 0) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        groupMessagesByDate();
    }, [messages]);

    // Polling para mensajes nuevos
    useEffect(() => {
        if (!selectedContact) return;

        const interval = setInterval(() => {
            loadMessages(selectedContact.phone);
        }, 5000);

        return () => clearInterval(interval);
    }, [selectedContact]);

    const loadMessages = async (phone) => {
        setLoading(true);
        try {
            const response = await fetch(`/whatsapp/messages/${phone}`);
            if (!response.ok) throw new Error("Error");
            const chatHistory = await response.json();

            const formattedMessages = chatHistory.map((m) => ({
                id: m.id,
                sender: m.sender,
                text: m.message,
                timestamp: new Date(m.created_at),
                formattedTime: format(new Date(m.created_at), "HH:mm", {
                    locale: es,
                }),
                date: format(new Date(m.created_at), "yyyy-MM-dd"),
                is_read: m.is_read || false,
            }));

            setMessages(formattedMessages);
        } catch (error) {
            console.error("Error cargando mensajes", error);
        } finally {
            setLoading(false);
        }
    };

    const groupMessagesByDate = () => {
        const groups = {};
        messages.forEach((msg) => {
            const dateKey = format(msg.timestamp, "yyyy-MM-dd");
            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(msg);
        });
        setGroupedMessages(groups);
    };

    const markMessagesAsRead = async (contactId) => {
        try {
            await fetch(`/whatsapp/mark-as-read/${contactId}`, {
                method: "POST",
            });
        } catch (error) {
            console.error(error);
        }
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!data.message.trim() || !selectedContact) return;

        post("/whatsapp/send", {
            onSuccess: () => {
                const newMsg = {
                    id: Date.now(),
                    sender: "me",
                    text: data.message,
                    timestamp: new Date(),
                    formattedTime: format(new Date(), "HH:mm", { locale: es }),
                    date: format(new Date(), "yyyy-MM-dd"),
                    is_read: true,
                };
                setMessages((prev) => [...prev, newMsg]);
                reset("message");
            },
        });
    };

    const handleDeleteMessage = async (messageId) => {
        try {
            const response = await fetch(`/whatsapp/messages/${messageId}`, {
                method: "DELETE",
            });
            if (response.ok) {
                setMessages((prev) => prev.filter((m) => m.id !== messageId));
                setShowDeleteModal(false);
                setMessageToDelete(null);
            }
        } catch (error) {
            console.error(error);
            alert("Error al eliminar");
        }
    };

    const handleDeleteAllMessages = async () => {
        if (!selectedContact) return;
        if (window.confirm(`¿Eliminar todos los mensajes?`)) {
            try {
                await fetch(
                    `/whatsapp/messages/contact/${selectedContact.id}/delete-all`,
                    {
                        method: "DELETE",
                    },
                );
                setMessages([]);
            } catch (error) {
                console.error(error);
                alert("Error al eliminar");
            }
        }
    };

    const getDateLabel = (dateKey) => {
        const date = new Date(dateKey);
        const today = format(new Date(), "yyyy-MM-dd");
        const yesterday = format(new Date(Date.now() - 86400000), "yyyy-MM-dd");
        if (dateKey === today) return "Hoy";
        if (dateKey === yesterday) return "Ayer";
        return format(date, "d 'de' MMMM", { locale: es });
    };

    return (
        <div className="flex h-[600px] bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
            {/* Lista Contactos */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col bg-gray-50">
                <div className="p-4 bg-white border-b">
                    <div className="relative">
                        <Search
                            className="absolute left-3 top-2.5 text-gray-400"
                            size={16}
                        />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>
                <div className="overflow-y-auto flex-1">
                    {contacts.map((contact) => (
                        <div
                            key={contact.id}
                            onClick={() => onSelectContact(contact)}
                            className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-100 transition-colors ${
                                selectedContact?.id === contact.id
                                    ? "bg-indigo-50 border-r-4 border-indigo-500"
                                    : ""
                            }`}
                        >
                            <div className="bg-indigo-100 p-2 rounded-full text-indigo-600">
                                <User size={24} />
                            </div>
                            <div>
                                <p className="font-semibold text-sm text-gray-800">
                                    {contact.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {contact.phone}
                                </p>
                            </div>
                        </div>
                    ))}
                    {contacts.length === 0 && (
                        <div className="p-4 text-center text-gray-500">
                            No hay contactos
                        </div>
                    )}
                </div>
            </div>

            {/* Chat */}
            <div className="flex-1 flex flex-col bg-white">
                {selectedContact ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b flex items-center justify-between bg-white">
                            <div className="flex items-center gap-3">
                                <div className="bg-gray-200 p-2 rounded-full">
                                    <User size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800">
                                        {selectedContact.name}
                                    </h3>
                                    <span className="text-xs text-green-500">
                                        {connection?.status === "conectado"
                                            ? "En línea"
                                            : "Desconectado"}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={handleDeleteAllMessages}
                                className="p-2 text-gray-400 hover:text-red-500"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>

                        {/* Mensajes */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#e5ddd5]"
                            style={{
                                backgroundImage:
                                    "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')",
                            }}
                        >
                            {loading ? (
                                <div className="flex justify-center items-center h-full">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                    <MessageCircle size={48} className="mb-4" />
                                    <p>No hay mensajes</p>
                                </div>
                            ) : (
                                Object.keys(groupedMessages)
                                    .sort()
                                    .map((dateKey) => (
                                        <div key={dateKey}>
                                            <div className="flex justify-center my-4">
                                                <span className="bg-gray-200/80 px-4 py-1 rounded-full text-xs font-medium text-gray-600">
                                                    {getDateLabel(dateKey)}
                                                </span>
                                            </div>
                                            {groupedMessages[dateKey].map(
                                                (m) => (
                                                    <div
                                                        key={m.id}
                                                        className={`flex ${
                                                            m.sender === "me"
                                                                ? "justify-end"
                                                                : "justify-start"
                                                        } group`}
                                                    >
                                                        <div className="relative max-w-[75%]">
                                                            <div
                                                                className={`p-3 rounded-lg shadow-sm ${
                                                                    m.sender ===
                                                                    "me"
                                                                        ? "bg-indigo-600 text-white rounded-tr-none"
                                                                        : "bg-white text-gray-800 rounded-tl-none"
                                                                }`}
                                                            >
                                                                <p className="text-sm">
                                                                    {m.text}
                                                                </p>
                                                                <div
                                                                    className={`text-xs mt-1 flex items-center justify-end gap-1 ${
                                                                        m.sender ===
                                                                        "me"
                                                                            ? "text-indigo-100"
                                                                            : "text-gray-400"
                                                                    }`}
                                                                >
                                                                    {
                                                                        m.formattedTime
                                                                    }
                                                                    {m.sender ===
                                                                        "me" && (
                                                                        <CheckCheck
                                                                            size={
                                                                                12
                                                                            }
                                                                        />
                                                                    )}
                                                                </div>
                                                            </div>
                                                            {m.sender ===
                                                                "me" && (
                                                                <button
                                                                    onClick={() => {
                                                                        setMessageToDelete(
                                                                            m,
                                                                        );
                                                                        setShowDeleteModal(
                                                                            true,
                                                                        );
                                                                    }}
                                                                    className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 bg-white rounded-full shadow-md"
                                                                >
                                                                    <Trash2
                                                                        size={
                                                                            12
                                                                        }
                                                                        className="text-red-500"
                                                                    />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    ))
                            )}
                        </div>

                        {/* Input */}
                        <form
                            onSubmit={handleSendMessage}
                            className="p-4 bg-gray-50 border-t flex items-center gap-2"
                        >
                            <input
                                type="text"
                                value={data.message}
                                onChange={(e) =>
                                    setData("message", e.target.value)
                                }
                                placeholder="Escribe un mensaje..."
                                className="flex-1 rounded-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                disabled={connection?.status !== "conectado"}
                            />
                            <button
                                type="submit"
                                disabled={processing || !data.message.trim()}
                                className="bg-indigo-600 p-2.5 rounded-full text-white hover:bg-indigo-700 disabled:bg-gray-300"
                            >
                                <Send size={20} />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-400">
                        <div className="text-center">
                            <MessageCircle size={64} className="mx-auto mb-4" />
                            <p>Selecciona un contacto</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Eliminar */}
            {showDeleteModal && messageToDelete && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full">
                        <h3 className="text-lg font-bold mb-4">
                            Eliminar mensaje
                        </h3>
                        <p className="text-gray-600 mb-4">¿Estás seguro?</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() =>
                                    handleDeleteMessage(messageToDelete.id)
                                }
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
