type Props = {
    [key: string]: any;
};

export default function Test(props: Props) {
    return (
        <form method="post" enctype="multipart/form-data">
            <div>
                <label for="file">选择要上传的文件</label>
                <input type="file" id="file" name="file" multiple />
            </div>
            <div>
                <button>提交</button>
            </div>
        </form>
    );
}
