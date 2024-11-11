from langchain.memory import ConversationBufferMemory
from collections import defaultdict

user_memories = defaultdict(lambda: ConversationBufferMemory())

def get_user_memory(session_id: str, chat_history: list = None):
    memory = user_memories[session_id]

    if chat_history and not memory.buffer:
        for chatter, msg in chat_history:
            role = "user" if chatter == "user" else "assistant"
            memory.chat_memory.add_message({"role": role, "content": msg})

    print("Memory state for session:", session_id, memory.buffer)
    return memory

def clear_user_memory(session_id: str):
    user_memories[session_id] = ConversationBufferMemory()
