import React, { useEffect } from 'react'

export default function CallTimes({ totalSecInCall, setTotalSecInCall, callAccepted }) {
    useEffect(() => {
        // 将 totalSecInCall 的值增加1，然后通过 setTimeout 在1秒后再次调用自身，以实现每秒更新一次通话时长
        const setSecInCall = () => {
            setTotalSecInCall((prev) => prev + 1);
            setTimeout(setSecInCall, 1000);  
        };

        if(callAccepted) {
            setSecInCall();
        }
        
        // 在组件卸载或callAccepted变化时，它会执行返回的函数，这里的作用是重置通话时长为0
        return () => setTotalSecInCall(0);
    }, [callAccepted]);

    return (
        <div className={`text-dark_text_2 ${totalSecInCall !== 0 ? "block" : "hidden"}`}>

            {/* 检查通话时长是否大于等于1小时。如果是，就会显示小时部分的内容 */}
            {parseInt(totalSecInCall / 3600 >= 0) ? (
                <>
                    {/* 检查是否需要在小时数前面添加 "0"，确保显示为两位数 */}
                    <span> 
                        {parseInt(totalSecInCall / 3600).toString().length < 2
                            ? "0" + parseInt(totalSecInCall / 3600) : parseInt(totalSecInCall / 3600)}
                    </span>
                    {/* 用于分隔小时、分钟和秒的部分 */}
                    <span>:</span>
                </>
            ) : null}
            <span>
                {/* 这一行用于显示分钟部分。它将总秒数除以 60 得到分钟数，然后检查是否需要在分钟数
                    前面添加 "0"，确保显示为两位数 */}
                {parseInt(totalSecInCall / 60).toString().length < 2
                    ? "0" + parseInt(totalSecInCall / 60) : parseInt(totalSecInCall / 60)}
            </span>
            <span>:</span>
            <span>
                {/* 这一行用于显示秒部分。它将总秒数取余 60 得到剩余的秒数，然后检查是否需要在秒数
                    前面添加 "0"，确保显示为两位数 */}
                {(totalSecInCall % 60).toString().length < 2
                    ? "0" + (totalSecInCall % 60) : totalSecInCall % 60}
            </span>
        </div>
    )
}
