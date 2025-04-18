import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("EducationPlatform", (m) => {
  // 1. Deploy EduToken (ERC-20)
  const eduToken = m.contract("EduToken");

  // 2. Deploy EduNFT (ERC-721)
  const eduNFT = m.contract("EduNFT");

  // 3. Deploy DonationVault (requires EduToken address)
  const donationVault = m.contract("DonationVault", [
    eduToken, // Constructor arg 1: EduToken address
  ]);

  // 4. Deploy EduFunding (requires both EduToken and DonationVault)
  const eduFunding = m.contract("EduFunding", [
    eduToken,         // Constructor arg 1
    donationVault,    // Constructor arg 2
  ]);

  // 5. Deploy SchoolStudentRegistry
  const schoolStudentRegistry = m.contract("SchoolStudentRegistry");

  return {
    eduToken,
    eduNFT,
    donationVault,
    eduFunding,
    schoolStudentRegistry,
  };
});
