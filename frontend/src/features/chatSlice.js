import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const CONVERSATION_ENDPOINT = `${process.env.REACT_APP_API_ENDPOINT}/conversation`;
const MESSAGE_ENDPOINT = `${process.env.REACT_APP_API_ENDPOINT}/message`;

// 定义初始状态
const initialState = {
    status: "", // 用户状态
    error: "", // 错误信息
    conversations: [],
    activeConversation: {}, //正在活跃的对话
    messages: [],
    notification: [],
    files: [],
};

export const getConversations = createAsyncThunk("conversation/all", async(token, { rejectWithValue }) => {
    try {
        const {data} = await axios.get(CONVERSATION_ENDPOINT, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return data;
    } catch (error) {
        return rejectWithValue(error.response.data.error.message);
    }
});

export const open_create_conversation = createAsyncThunk("conversation/open_create", async(values, { rejectWithValue }) => {
    const { token, receiver_id, isGroup } = values;
    try {
        const {data} = await axios.post(CONVERSATION_ENDPOINT, {receiver_id, isGroup }, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return data;
    } catch (error) {
        return rejectWithValue(error.response.data.error.message);
    }
});

export const getConversationMessages = createAsyncThunk("conervsation/messages", async (values, { rejectWithValue }) => {
    const { token, convo_id } = values;
    try {
        const { data } = await axios.get(`${MESSAGE_ENDPOINT}/${convo_id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return data;
    } catch (error) {
        return rejectWithValue(error.response.data.error.message);
    }
});

export const sendMessage = createAsyncThunk("message/send", async (values, { rejectWithValue }) => {
    const { token, message, convo_id, files } = values;
    try {
        const { data } = await axios.post( MESSAGE_ENDPOINT, {
                message, convo_id, files,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return data;
    } catch (error) {
        return rejectWithValue(error.response.data.error.message);
    }
});

export const createGroupConversation = createAsyncThunk("conervsation/create_group", async (values, { rejectWithValue }) => {
    const { token, name, users } = values;
    try {
        const { data } = await axios.post(
            `${CONVERSATION_ENDPOINT}/group`, { 
                name, users, 
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return data;
    } catch (error) {
        return rejectWithValue(error.response.data.error.message);
    }
});


export const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        // state表示当前的状态，action表示要执行的动作
        setActiveConveration: (state, action) => {
            state.activeConversation = action.payload;
        },
        updateMessagesAndConversations: (state, action) => {
            //update messages
            let convo = state.activeConversation;
            if (convo._id === action.payload.conversation._id) {
                state.messages = [...state.messages, action.payload];
            }
            //update conversations
            let conversation = {
                ...action.payload.conversation,
                latestMessage: action.payload,
            };
            let newConvos = [...state.conversations].filter(
                (c) => c._id !== conversation._id
            );
            newConvos.unshift(conversation);
            state.conversations = newConvos;
        },
        addFiles: (state, action) => {
            state.files = [...state.files, action.payload];
        },
        clearFiles: (state, action) => {
            state.files = [];
        },
        removeFileFromFiles: (state, action) => {
            let index = action.payload; // 提取出要移除的文件的下标
            let files = [...state.files]; // 创建一个状态中文件列表的副本，以确保对原状态的修改是不可变的
            let fileToRemove = [files[index]]; //  创建一个包含要移除文件的数组
            /* 过滤掉要移除的文件，返回一个新的文件列表，然后将其赋值给状态中的files字段。这里使用 
                !fileToRemove.includes(file)来确保只保留那些不在fileToRemove数组中的文件，即移除指定索引位置的文件 */
            state.files = files.filter((file) => !fileToRemove.includes(file));
        },
    },

    extraReducers(builder) {
        builder.addCase(getConversations.pending, (state, action) => {
            state.status = "loading";
        })
        .addCase(getConversations.fulfilled, (state, action) => {
            state.status = "succeeded";
            state.conversations = action.payload;
        })
        .addCase(getConversations.rejected, (state, action) => {
            state.status = "failed";
            state.error = action.payload;
        })
        .addCase(open_create_conversation.pending, (state, action) => {
            state.status = "loading";
        })
        .addCase(open_create_conversation.fulfilled, (state, action) => {
            state.status = "succeeded";
            state.activeConversation = action.payload;
            state.files = [];
        })
        .addCase(open_create_conversation.rejected, (state, action) => {
            state.status = "failed";
            state.error = action.payload;
        })
        .addCase(getConversationMessages.pending, (state, action) => {
            state.status = "loading";
        })
        .addCase(getConversationMessages.fulfilled, (state, action) => {
            state.status = "succeeded";
            state.messages = action.payload;
        })
        .addCase(getConversationMessages.rejected, (state, action) => {
            state.status = "failed";
            state.error = action.payload;
        })
        .addCase(sendMessage.pending, (state, action) => {
            state.status = "loading";
        })
        .addCase(sendMessage.fulfilled, (state, action) => {
            state.status = "succeeded";
            // 将新发送的消息添加到消息列表中。action.payload 包含了新发送的消息
            state.messages = [...state.messages, action.payload];
            /* 创建一个新的对话(conversation)对象，该对象是原始对话对象action.payload.conversation的克隆，
            并将其最新消息字段(latestMessage)设置为新发送的消息(action.payload)。 */
            let conversation = {...action.payload.conversation, latestMessage: action.payload, };
            // 移除掉与新对话对象ID不同的对话
            let newConvos = [...state.conversations].filter((c) => c._id !== conversation._id);
            // 新的对话对象添加到新对话列表的开头
            newConvos.unshift(conversation);
            // 对话列表更新为新的对话列表
            state.conversations = newConvos;
            state.files = [];
        })
        .addCase(sendMessage.rejected, (state, action) => {
            state.status = "failed";
            state.error = action.payload;
        })
    }
});

export const { setActiveConveration, updateMessagesAndConversations, addFiles, clearFiles, removeFileFromFiles } = chatSlice.actions;

export default chatSlice.reducer;