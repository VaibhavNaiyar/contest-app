import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_API_KEY });

export async function getNotionPage(pageId: string) {
    const blocks = await notion.blocks.children.list({ block_id: pageId });
    return blocks.results;
}

// Converts Notion blocks to plain text for feeding into the OpenAI prompt
export function blocksToText(blocks: any[]): string {
    return blocks
        .map((block: any) => {
            const type: string = block.type;
            const content = block[type];
            if (!content) return "";

            const richText: any[] = content.rich_text ?? [];
            const text = richText.map((t: any) => t.plain_text).join("");

            if (type === "heading_1") return `# ${text}`;
            if (type === "heading_2") return `## ${text}`;
            if (type === "heading_3") return `### ${text}`;
            if (type === "bulleted_list_item") return `- ${text}`;
            if (type === "numbered_list_item") return `1. ${text}`;
            if (type === "code") return `\`\`\`${content.language ?? ""}\n${text}\n\`\`\``;
            if (type === "paragraph") return text;

            return "";
        })
        .filter(Boolean)
        .join("\n\n");
}
