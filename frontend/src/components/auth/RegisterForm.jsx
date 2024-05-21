import {useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import { signUpSchema } from "../../utils/validation";
import AuthInput from "./AuthInput";
import {useDispatch, useSelector} from "react-redux";
import PulseLoader from "react-spinners/PulseLoader";
import { Link, useNavigate } from "react-router-dom";
import { changeStatus, registerUser } from "../../features/userSlice";
import { useState } from "react";
import Picture from "./Picture";
import axios from "axios";
const cloud_name = process.env.REACT_APP_CLOUD_NAME;
const cloud_secret = process.env.REACT_APP_CLOUD_SECRET;

export default function RegisterForm(){
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { status, error } = useSelector((state) => state.user);
    const [ picture, setPicture ] = useState();
    const [readablePicture, setReadablePicture] = useState("");

    // 使用react-hook-form的useForm钩子函数，通过解构赋值获取所需的属性和方法
    const {register, handleSubmit, watch, formState: {errors}, } = useForm({
        // 使用yupResolver将yup验证模式应用于表单
        resolver: yupResolver(signUpSchema),
    });

    // 表单提交时的回调函数，用于处理提交的数据
    const onSubmit = async (data) => {
        dispatch(changeStatus("loading"));
        if(picture){
            //上传图片到cloudinary 并且注册user
            await uploadImage().then(async (response) => {
                let res = await dispatch(
                    registerUser({ ...data, picture: response.secure_url})
                );    

                if(res?.payload?.user){
                    navigate("/");
                }
            }); 
        } else {
            let res = await dispatch(registerUser({...data, picture: ""}));

            if(res?.payload?.user){
                navigate("/");
            }
        }
    };

    const uploadImage = async() => {
        //创建一个FormData对象，用于将图像数据和其他表单字段一起发送到服务器
        let formData = new FormData();
        //将cloud_secret追加到FormData中，并使用"upload_preset"作为字段名
        formData.append("upload_preset", cloud_secret);
        formData.append("file", picture);
        const {data} = await axios.post(`https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`, formData);
        return data;
    };

    return (
        <div className="h-screen w-full flex items-center justify-center overflow-hidden">
            <div className="max-w-md space-y-8 p-10 dark:bg-dark_bg_2 rounded-xl">
                {/* Heading */}
                <div className="text-center dark:text-dark_text_1">
                    <h2 className="mt-6 text-3xl font-bold">Welcome</h2>
                    <p className="mt-2 text-sm">Sign up</p>
                </div>

                {/* Form */}
                <form className="mt-6 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <AuthInput name="name" type="text" placeholder="Full Name" 
                        register={register} error={errors?.name?.message} />

                    <AuthInput name="email" type="text" placeholder="Email Address"
                        register={register} error={errors?.email?.message} />

                    <AuthInput name="status" type="text" placeholder="Status (Optional)"
                        register={register} error={errors?.status?.message} />

                    <AuthInput name="password" type="password" placeholder="Password"
                        register={register} error={errors?.password?.message} />

                    <Picture setPicture={setPicture} readablePicture={readablePicture} setReadablePicture={setReadablePicture} />

                    {error ? (<div>
                        <p className="text-red-400">{error}</p>
                    </div>) : null}

                    <button className="w-full flex justify-center bg-green_1 text-gray-100 p-4 rounded-full tracking-wide
                        font-semibold focus:outline-none hover:bg-green_2 shadow-lg cursor-pointer transition ease-in duration-300" 
                        type="submit">

                        {status === "loading" ? (<PulseLoader color="#fff" size={16} />) : "Sign up"}
                    </button>

                    <p className="flex flex-col items-center justify-center mt-10 text-center text-md dark:text-dark_text_1">
                        <span>Have an account ?</span>
                        <Link to="/login" className="hover:underline cursor-pointer transition ease-in duration-300">
                            Sign in
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    )
}