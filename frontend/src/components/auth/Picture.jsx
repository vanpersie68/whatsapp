import React, { useRef, useState } from 'react';

export default function Picture({setPicture, readablePicture, setReadablePicture}) {
    const inputRef = useRef();
    const [error, setError] = useState("");

    const handlePicture = (event) => {
        let pic = event.target.files[0];
        if(pic.type !== "image/png" && pic.type !== "image/jpeg" && pic.type !== "image/webp"){
            setError(`${pic.name} format is not supported.`);
            return; 
        } else if(pic.size > 1024 * 1024 * 5) { // 5mb
            setError(`${pic.name} is too large, maximum 5mb allowed.`);
            return; 
        } else {
            setError("");
            setPicture(pic);
            const reader = new FileReader(); // 读取文件内容
            reader.readAsDataURL(pic); // 这种DataURL包含文件的Base64编码表示，可以直接用于在网页中显示图片
            // 当readAsDataURL操作完成时，该回调函数将被触发
            reader.onload = (event) => {
                setReadablePicture(event.target.result);
            }
        }
    };

    const handleChangePic = () => {
        setPicture("");
        setReadablePicture("");
    }

    return (
        <div className='mt-8 content-center dark:text-dark_text_1 space-y-1'>
            <label htmlFor="picture" className="text-sm font-bold tracking-wide">
                Picture (Optional)
            </label>

            {readablePicture ?
                <div>
                    <img src={readablePicture} alt='picture' className='w-20 h-20 object-cover rounded-full' />
                    <div className='mt-2 w-20 py-1 dark:bg-dark_bg_3 rounded-md text-xs font-bold flex items-center justify-center cursor-pointer'
                        onClick={() => handleChangePic()}>
                        Remove
                    </div>
                </div> :
                <div className='w-full h-12 dark:bg-dark_bg_3 rounded-md font-bold flex items-center justify-center cursor-pointer'
                    onClick={() => inputRef.current.click()}>
                    Upload Picture
                </div>}

            <input type='file' name='picture' id='picture' accept="image/png, image/jpeg, image/webp" hidden
                onChange={handlePicture} ref={inputRef} />

            {/* error */}
            <div className='mt-2'>
                <p className='text-red-400'>{error}</p>
            </div>
        </div>
    );
}
