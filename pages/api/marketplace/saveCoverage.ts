import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const lulaApi = process.env.LULA_API_URL;
        const authUrl = process.env.MARKETPLACE_AUTH_TOKEN_URL;
        const identityUrl = process.env.MARKETPLACE_IDENTITY_URL;

        const atoken = await axios.post(`${authUrl}`, {
            grant_type: "client_credentials",
            client_id: process.env.MARKETPLACE_AUTH_CLIENT_ID,
            client_secret: process.env.MARKETPLACE_AUTH_CLIENT_SECRET,
        });

        const accessToken = atoken.data.access_token;

        const config = {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        };

        let added = [];

        const user = req.body.User;
        const autoLiability = req.body.autoLiability;
        const physicalDamage = req.body.physicalDamage;
        const cargo = req.body.cargo;
        const generalLiability = req.body.generalLiability;

        const customer = await axios.post(
            `${identityUrl}/customers`,
            JSON.stringify({
                name: req.body.BusinessLegalName,
            }),
            config
        );

        const insured = await axios.post(
            `${lulaApi}/marketplace/api/insured`,
            {
                Id: customer.data.id,
                BusinessLegalName: req.body.BusinessLegalName,
                BusinessAddressLine1: req.body.BusinessAddressLine1,
                BusinessAddressLine2: req.body.BusinessAddressLine2 || null,
                BusinessCity: req.body.BusinessCity,
                BusinessState: req.body.BusinessState,
                BusinessZipcode: req.body.BusinessZipCode,
            },
            config
        );

        console.log(`Add insured ${insured.status}`);

        const errorMessages = [];

        try {
            if (user.emailAddress) {
                await axios.post(
                    `${identityUrl}/customers/${customer.data.id}/invitations`,
                    {
                        emailAddress: user.emailAddress,
                        givenName: user.givenName,
                        familyName: user.familyName,
                    },
                    config
                );
            }
        } catch (error) {
            errorMessages.push(
                "Failed to send invite: " + (error as Error).message
            );
        }
        try {
            if (autoLiability.policyNumber) {
                await axios.post(
                    `${lulaApi}/marketplace/api/insured/coverages`,
                    {
                        coverageType: "auto-liability",
                        policyNumber: autoLiability.policyNumber,
                        insurerId: autoLiability.insurerId,
                        insuredId: customer.data.id,
                        startDate: autoLiability.startDate,
                        endDate: autoLiability.endDate,
                        coverageData: autoLiability.coverageData,
                    },
                    config
                );

                added.push("auto liability");
            }
        } catch (error) {
            errorMessages.push(
                "Failed to add auto liability coverage: " +
                    (error as Error).message
            );
        }

        try {
            if (physicalDamage.policyNumber) {
                await axios.post(
                    `${lulaApi}/marketplace/api/insured/coverages`,
                    {
                        coverageType: "auto-physical-damage-coverage",
                        policyNumber: physicalDamage.policyNumber,
                        insurerId: physicalDamage.insurerId,
                        insuredId: customer.data.id,
                        startDate: physicalDamage.startDate,
                        endDate: physicalDamage.endDate,
                        coverageData: physicalDamage.coverageData,
                    },
                    config
                );

                added.push("physical damage");
            }
        } catch (error) {
            errorMessages.push(
                "Failed to add physical damage coverage: " +
                    (error as Error).message
            );
        }

        try {
            if (cargo.policyNumber) {
                await axios.post(
                    `${lulaApi}/marketplace/api/insured/coverages`,
                    {
                        coverageType: "motor-cargo-coverage",
                        policyNumber: cargo.policyNumber,
                        insurerId: cargo.insurerId,
                        insuredId: customer.data.id,
                        startDate: cargo.startDate,
                        endDate: cargo.endDate,
                        coverageData: cargo.coverageData,
                    },
                    config
                );

                added.push("cargo");
            }
        } catch (error) {
            errorMessages.push(
                "Failed to add cargo coverage: " + (error as Error).message
            );
        }

        try {
            if (generalLiability.policyNumber) {
                await axios.post(
                    `${lulaApi}/marketplace/api/insured/coverages`,
                    {
                        coverageType: "general-liability",
                        policyNumber: generalLiability.policyNumber,
                        insurerId: generalLiability.insurerId,
                        insuredId: customer.data.id,
                        startDate: generalLiability.startDate,
                        endDate: generalLiability.endDate,
                        coverageData: generalLiability.coverageData,
                    },
                    config
                );

                added.push("general liability");
            }
        } catch (error) {
            errorMessages.push(
                "Failed to add general liability coverage: " +
                    (error as Error).message
            );
        }

        if (errorMessages.length > 0) {
            res.status(500).json({ errorMessages });
        } else {
            res.status(200).json(
                `Added coverages successfully: {${added.join(", ")}}`
            );
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export default handler;
