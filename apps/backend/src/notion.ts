import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_API_KEY });

export async function getNotionPage(pageId: string) {
    const blocks = await notion.blocks.children.list({ block_id: pageId });
    return blocks.results;
}
