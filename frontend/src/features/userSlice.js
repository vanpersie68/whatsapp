import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const AUTH_ENDPOINT = `${process.env.REACT_APP_API_ENDPOINT}/auth`;

// 定义初始状态
const initialState={
    status: "", // 用户状态
    error: "", // 错误信息
    user: {
        id: "",
        name: "",
        email: "",
        picture: "",
        status: "",
        token: "",
    }
}

export const registerUser=createAsyncThunk("auth/register", async(values, {rejectWithValue}) => {
    try{
        const {data} = await axios.post(`${AUTH_ENDPOINT}/register`, {
            ...values,
        });
        return data;
    } catch(error) {
        return rejectWithValue(error.response.data.error.message);
    }
});

export const loginUser=createAsyncThunk("auth/login", async(values, {rejectWithValue}) => {
    try{
        const {data} = await axios.post(`${AUTH_ENDPOINT}/login`, {
            ...values,
        });
        return data;
    } catch(error) {
        return rejectWithValue(error.response.data.error.message);
    }
});


//使用 createSlice 创建了一个 Redux reducer，命名为 "user"。
export const userSlice=createSlice({
    name: "user",
    initialState,
    /* 在 reducers 对象中定义了一个名为 "logout" 的 action，
    用于处理用户注销操作。该 action 会重置用户状态、错误信息和用户信息。 */
    reducers: {
        logout: (state) => {
            state.status = "";
            state.error = "";
            state.user = {
                id: "",
                name: "",
                email: "",
                picture: "",
                status: "",
                token: "",
            };
        },

        changeStatus: (state, action) => {
            state.status = action.payload;
        },
    },
    extraReducers(builder){
        /* 这一部分处理了异步操作开始时的状态。当registerUser的异步action处于pending状态（即异步操作开始时），
        Reducer会更新state.status为"loading"，表示正在加载中 */
        builder.addCase(registerUser.pending, (state, action) => {
            state.status = "loading";
        }) /* 这一部分处理了异步操作成功时的状态。当registerUser的异步action处于fulfilled状态（即异步操作成功时），
        Reducer会更新state.status为"succeed"，表示操作成功。 */
        .addCase(registerUser.fulfilled, (state, action) => {
            state.status = "succeeded";
            state.error = "";
            state.user = action.payload.user; //包含了异步操作成功后的返回数据，这里假设返回的数据中包含了用户信息
        })
        .addCase(registerUser.rejected, (state, action) => {
            state.status = "failed";
            state.error = action.payload;
        })
        .addCase(loginUser.pending, (state, action) => {
            state.status = "loading";
        })
        .addCase(loginUser.fulfilled, (state, action) => {
            state.status = "succeeded";
            state.error = "";
            state.user = action.payload.user; 
        })
        .addCase(loginUser.rejected, (state, action) => {
            state.status = "failed";
            state.error = action.payload;
        });
    },
})

// 导出了 "logout" action，以便其他部分的代码可以使用
export const {logout, changeStatus} = userSlice.actions;

// 导出了整个 reducer，以便集成到 Redux store 中
export default userSlice.reducer;