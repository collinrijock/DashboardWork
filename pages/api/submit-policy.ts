import type { NextApiRequest, NextApiResponse } from 'next';

async function submitPolicy(accountEntityId: string, policyNumber: string, limit: string, deductible: string, token?: string) {
  const response = await fetch(`${process.env.LULA_API_URL}/policy/${accountEntityId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'x-firebase-auth': token }),
    },
    body: JSON.stringify({
      policyNumber,
      limit,
      deductible,
    }),
  });

  if (!response.ok) {
    throw new Error(`An error occurred: ${response.statusText}`);
  }

  return await response.json();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { accountEntityId, policyNumber, limit, deductible, token } = req.body;
    const policy = await submitPolicy(accountEntityId, policyNumber, limit, deductible, token);
    res.status(200).json(policy);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}
