type Block = {
    type: string;
    [key: string]: any;
};

function richText(arr: any[]): string {
    return arr?.map((t: any) => t.plain_text).join("") ?? "";
}

export function NotionRenderer({ blocks }: { blocks: Block[] }) {
    const elements = blocks.map((block, i) => {
        const content = block[block.type];
        if (!content) return null;

        switch (block.type) {
            case "paragraph":
                return <p key={i}>{richText(content.rich_text)}</p>;
            case "heading_1":
                return <h1 key={i}>{richText(content.rich_text)}</h1>;
            case "heading_2":
                return <h2 key={i}>{richText(content.rich_text)}</h2>;
            case "heading_3":
                return <h3 key={i}>{richText(content.rich_text)}</h3>;
            case "bulleted_list_item":
                return <ul key={i}><li>{richText(content.rich_text)}</li></ul>;
            case "numbered_list_item":
                return <ol key={i}><li>{richText(content.rich_text)}</li></ol>;
            case "code":
                return (
                    <pre key={i}>
                        <code>{richText(content.rich_text)}</code>
                    </pre>
                );
            default:
                return null;
        }
    });

    return <div className="notion-content">{elements}</div>;
}
