import axios from "axios";

const cloud_name = process.env.REACT_APP_CLOUD_NAME;
const cloud_secret = process.env.REACT_APP_CLOUD_SECRET;

export const uploadFiles = async (files) => {
    //创建一个FormData对象，用于将图像数据和其他表单字段一起发送到服务器
    let formData = new FormData();
    //将cloud_secret追加到FormData中，并使用"upload_preset"作为字段名
    formData.append("upload_preset", cloud_secret);
    let uploaded = [];

    for(const f of files) {
        const { file, type } = f;
        formData.append("file", file);
        let res = await uploadToCloudinary(formData);
        
        uploaded.push({
            file: res,
            type: type,
        });
    }

    return uploaded;
};

const uploadToCloudinary = async (formData) => {
    /* Promise的主要作用是处理异步操作。它提供了一种更加结构化和可管理的方式来处理异步代码，
        避免了回调地狱（Callback Hell）和复杂的嵌套结构。如果请求成功，.then()方法会被调用，
        它接受一个回调函数，该函数会从响应对象中提取data字段，并通过调用 resolve(data)来解决前面
        创建的Promise对象，从而将 Cloudinary的响应数据传递给调用者。 */
    return new Promise(async(resolve) => {
        return await axios.post(`https://api.cloudinary.com/v1_1/${cloud_name}/raw/upload`, formData)
            .then(( { data}) => {
                resolve(data);
            })
            .catch((err) => {
                console.log(err);
            })
    });
};