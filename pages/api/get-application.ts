import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: "Missing application ID." });
  }

  try {
    const response = await axios({
      method: "post",
      url: "https://api.staging-lula.is/embedded/v1/backoffice/",
      headers: {
        Authorization: "Bearer 1eJ9AIIMZ9KQF70BlAipo6EPeIVte0Gr",
        "Content-Type": "application/json",
      },
      data: {},
    });

    const allApplications = response.data;

    const filteredApplication = allApplications.find(
      (app: any) => app.id === id
    );

    if (!filteredApplication) {
      return res.status(404).json({ message: "Application not found." });
    }

    const {
      content: {
        asJson: {
          applicant,
          ein,
          fleetSize,
          businessName,
          businessAddress,
        },
      },
      insuranceProgram,
      requester,
      ...rest
    } = filteredApplication;

    const simplifiedApplication = {
      ...rest,
      ...applicant,
      ein,
      fleetSize,
      businessName,
      businessAddress,
      insuranceProgramName: insuranceProgram.name,
      insuranceProgramVersion: insuranceProgram.version,
      ...requester,
    };

    res.status(200).json(simplifiedApplication);
  } catch (error) {
    res.status(500).json({ message: "Error fetching data." });
  }
};

export default handler;
