import { useRef } from "react";
import { PhotoIcon } from "../../../../../svg";
import { useDispatch, useSelector } from "react-redux";
import { addFiles } from "../../../../../features/chatSlice";
import { getFileType } from "../../../../../utils/file";

export default function PhotoAttachment() {
    const dispatch = useDispatch();
    const inputRef = useRef(null);
    const imageHandler = (e) => {
        let files = Array.from(e.target.files);
        files.forEach((file) => {
            if (file.type !== "image/png" && file.type !== "image/jpeg" &&
                file.type !== "image/gif" && file.type !== "image/webp" &&
                file.type !== "video/mp4" && file.type !== "video/mpeg" &&
                file.type !== "image/webm" && file.type !== "image/webp") {
                
                // filter 的条件是 只保留那些文件对象的 name 属性与给定 file 对象的 name 属性不相等的元素
                files = files.filter((item) => item.name !== file.name);
                return;
            } else if (file.size > 1024 * 1024 * 10) {
                files = files.filter((item) => item.name !== file.name);
                return;
            } else {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = (e) => { dispatch( 
                        addFiles({ file: file, fileData: e.target.result, type: getFileType(file.type) })
                    );
                };
            }
        });
    };
    return (
        <li>
            <button type="button" className="bg-[#BF59CF] rounded-full" onClick={() => inputRef.current.click()} >
                <PhotoIcon />
            </button>

            <input accept="image/png,image/jpeg,image/gif,image/webp,video/mp4,video/mpeg"
                type="file" hidden multiple ref={inputRef} onChange={imageHandler} />
        </li>
    );
}
