import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { accountEntityId, policyNumber, limit, deductible } = req.body;
    const token = String(req.headers["x-firebase-auth"]);

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

    if (response.ok) {
      res.status(200).json({ message: 'Policy submitted successfully!' });
    } else {
      const errorData = await response.json();
      res.status(response.status).json({ message: errorData.message || 'Failed to submit the policy. Please try again.' });
    }
  } catch (error: any) {
    console.error('Error submitting policy:', error);
    res.status(500).json({ message: 'An error occurred while submitting the policy. Please try again.' });
  }
}
