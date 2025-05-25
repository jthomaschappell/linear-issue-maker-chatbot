import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req) {
  try {
    const { tasks } = await req.json();
    if (!tasks || typeof tasks !== "string") {
      return NextResponse.json({ error: "No tasks provided" }, { status: 400 });
    }

    const openRouterKey = process.env.OPENROUTER_API_KEY;
    console.log('OpenRouter API Key:', openRouterKey); // Added debug log
    if (!openRouterKey) {
      return NextResponse.json({ error: "Missing OpenRouter API key" }, { status: 500 });
    }

    // System prompt for converting tasks to Linear issues
    const systemPrompt = `You are a helpful assistant that converts a list of product or engineering tasks/features into a JSON array of Linear issues. Each issue should have: title, description, priority (medium), and state (backlog). Do not add any extra commentary, only return the JSON array.`;

    const openRouterPayload = {
      model: "qwen/qwen3-32b",
      messages: [
        { role: "user", content: tasks },
        { role: "system", content: systemPrompt }
      ]
    };

    const openRouterRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openRouterKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(openRouterPayload),
    });
    const openRouterData = await openRouterRes.json();
    let issues = "";
    try {
      issues = openRouterData.choices?.[0]?.message?.content?.trim() || "";
    } catch (e) {
      return NextResponse.json({ error: "Failed to parse OpenRouter response" }, { status: 500 });
    }
    return NextResponse.json({ issues });
  } catch (err) {
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}