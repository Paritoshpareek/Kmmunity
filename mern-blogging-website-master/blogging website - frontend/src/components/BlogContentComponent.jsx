
const Img = ({ url, caption }) => {
    return (
        <div>
            <img src={url} />
            {
                caption.length ? <p className="w-full text-center my-3 md:mb-12 text-base text-dark-grey">{caption}</p> : ""
            }
        </div>
    )
}
const Quote = ({ quote, caption }) => {
    return (
        <div className="bg-purple/10 p-3 pl-5 border-l-4 border-purple ">

            <p className="text-xl leading-10 md:text-2xl">{quote} </p>
            {
                caption.length ? <p className="w-full text-purple text-base">{caption}</p> : ""
            }


        </div >
    )
}
const List = ({ style, items }) => {
    return (
        <ol className={`pl-5 ${style === "ordered" ? " list-decimal" : " list-disc"}`}>
            {
                items.map((listItem, i) => {
                    return <li key={i} className="my-4" dangerouslySetInnerHTML={{ __html: listItem }}></li>
                })
            }
        </ol>
    )
}
const Embed = ({ data }) => {
    if (data.service === 'youtube' || data.service === 'twitter') {

        return (
            <div className='flex flex-col justify-center items-center my-5 overflow-hidden'>
                <iframe
                    title={`${data.service} Embed`}
                    width={data.width}
                    height={data.height}
                    src={data.service === 'twitter' ? `${data.embed}&theme=dark` : data.embed}
                    allowFullScreen
                    className={`border-none rounded-lg shadow-md w-full h-full ${data.service === 'youtube' ? 'aspect-video' : 'aspect-square'}`}
                ></iframe>
                <p className="w-full text-center my-3 md:mb-12 text-base md:text-lg lg:text-xl text-dark-grey ">{data.caption}</p>
            </div>
        );
    }
    return (
        <div>
            <p>Unsupported embed service: {data.service}</p>
        </div>
    );
};
const Warning = ({ title, message }) => {
    return (
        <div className=" bg-red/10 p-3 pl-5   border-l-4 border-red mb-4">
            <p className="text-xl font-bold mb-2">⚠️ {title}</p>
            <p className="text-gray-700">{message}</p>
        </div>
    )
}

const BlogContent = ({ block }) => {

    let { type, data } = block;

    if (type == "paragraph") {
        return <p dangerouslySetInnerHTML={{ __html: data.text }}></p>
    }
    if (type == "header") {
        if (data.level == 3) {
            return <h3 className="text-3xl font-bold" dangerouslySetInnerHTML={{ __html: data.text }}></h3>
        }
        return <h2 className="text-4xl font-bold" dangerouslySetInnerHTML={{ __html: data.text }}></h2>
    }

    if (type == 'image') {
        return < Img url={data.file.url} caption={data.caption} />
    }
    if (type == "quote") {
        return <Quote quote={data.text} caption={data.caption} />
    }
    if (type == "list") {
        return <List style={data.style} items={data.items} />
    } if (type == "embed") {
        return <Embed data={data} />
    }
    if (type == "delimiter") {
        return <p className="text-2xl font-bold flex items-center justify-center tracking-wide">* * *</p>
    }
    if (type == "warning") {
        return <Warning title={data.title} message={data.message} />
    }
    else {
        return <h1>The block is not rendered because it is of invalid type</h1>
    }
}
export default BlogContent;