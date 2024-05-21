import {combineReducers, configureStore} from "@reduxjs/toolkit";
import {persistReducer, persistStore} from "redux-persist";
import userSlice from "../features/userSlice";
import storage from "redux-persist/lib/storage";
import createFilter from "redux-persist-transform-filter";
import chatSlice from "../features/chatSlice";

// 创建一个过滤器，只保存状态中的 "user" 部分
const saveUserOnlyFilter=createFilter("user", ["user"]);

// Redux Persist 的配置
/* 这个配置告诉 Redux Persist 如何将 Redux store 中的数据存储到本地，并且
只持久化 "user" reducer 的状态。这在应用中通常用于保留用户登录状态等信息，
使得用户刷新页面或关闭浏览器后仍能保持登录状态。 */
const persistConfig = {
    key: "user", // 存储数据的键值
    storage, // 存储引擎（默认是本地存储）
    whitelist: ["user"], // 要持久化的 reducer 数组
    /* 指定了要应用的转换器，这里使用了一个名为 saveUserOnlyFilter 的
    过滤器，用于只保存状态中的 "user" 部分，过滤掉其他不需要的数据。 */
    transforms: [saveUserOnlyFilter] 
};

// combineReducers 是 Redux Toolkit 提供的一个函数，用于将多个 reducer 合并成一个根 reducer
/* 当应用中发生 action 时，根 reducer (rootReducer) 会调用 userSlice reducer 来处理与用户相关的
状态更新。整个 state 树被组织成不同部分，每个部分由相应的 reducer 处理。这有助于更好地组织和维护
复杂的应用状态。 */
const rootReducer = combineReducers({
    user: userSlice,
    chat: chatSlice,
});

/* 通过调用 persistReducer，将持久化配置应用到根 reducer 上，得到了一个新的 reducer，
即 persistedReducer。这个新的 reducer 具有持久化存储数据的功能。*/
const persistedReducer = persistReducer(persistConfig, rootReducer);

// 创建 Redux store
/* 通过这些配置，store 成功创建，并使用了经过持久化配置的 reducer。这个 store 可以在整个应用中管理和维
护状态，而且通过 Redux Persist 的配置，状态可以持久化到存储引擎中，以实现刷新页面或关闭浏览器后的状态恢复。 */
export const store = configureStore({
    reducer: persistedReducer, // 使用经过持久化配置的 reducer
    // 指定了中间件，这里使用了 getDefaultMiddleware 来获取默认的中间件，
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            // 禁用序列化检查以处理 Redux Toolkit 的特殊行为
            serializableCheck: false,
        }),
    devTools: true,  // 启用了 Redux DevTools 扩展，以便在浏览器中使用 Redux DevTools 来调试应用的状态变化。
});

// 创建 Redux Persist 的存储对象
export const persistor = persistStore(store);