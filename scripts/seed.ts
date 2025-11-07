import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await prisma.version.deleteMany();
  await prisma.experiment.deleteMany();

  // Create sample experiments
  const exp1 = await prisma.experiment.create({
    data: {
      name: "New Checkout Flow",
      expParameter: "checkout_v2",
      userGroup: "premium_users",
      numbersList: ["123456", "789012", "345678", "901234"],
      liveDate: new Date("2024-01-15"),
      platforms: ["web", "mobile"],
      context: `## Overview
This experiment introduces a redesigned checkout flow with improved UX and conversion optimization.

### Key Features
- **Streamlined process**: Reduced steps from 5 to 3
- **Payment options**: Added Apple Pay and Google Pay
- **Progress indicator**: Visual progress bar for better user guidance

### Expected Impact
- 15% increase in conversion rate
- 20% reduction in cart abandonment`,
      isActive: true,
    },
  });

  const exp2 = await prisma.experiment.create({
    data: {
      name: "AI-Powered Recommendations",
      expParameter: "ai_recommendations",
      userGroup: "all_users",
      numbersList: ["555123", "555456", "555789"],
      liveDate: new Date("2024-02-01"),
      platforms: ["web", "ios", "android"],
      context: `## Overview
Machine learning-powered product recommendations using collaborative filtering.

### Technical Details
- Uses user behavior data and purchase history
- Real-time model updates every 6 hours
- A/B testing with 50/50 split`,
      isActive: true,
    },
  });

  const exp3 = await prisma.experiment.create({
    data: {
      name: "Dark Mode Theme",
      expParameter: "dark_mode",
      userGroup: "beta_testers",
      numbersList: [],
      liveDate: new Date("2024-01-20"),
      platforms: ["web"],
      context: `## Overview
New dark mode theme option for better user experience in low-light conditions.

### Features
- System preference detection
- Manual toggle option
- Smooth theme transitions`,
      isActive: true,
    },
  });

  const exp4 = await prisma.experiment.create({
    data: {
      name: "Social Sharing Integration",
      expParameter: "social_sharing",
      userGroup: "power_users",
      numbersList: ["999888", "999777", "999666"],
      liveDate: new Date("2023-12-10"),
      platforms: ["ios", "android"],
      context: `## Overview
Enhanced social sharing capabilities with one-tap sharing to major platforms.

### Supported Platforms
- Facebook
- Twitter/X
- Instagram Stories
- WhatsApp`,
      isActive: false,
    },
  });

  const exp5 = await prisma.experiment.create({
    data: {
      name: "Voice Search Feature",
      expParameter: "voice_search",
      userGroup: "early_adopters",
      numbersList: ["111222", "333444"],
      liveDate: new Date("2024-02-15"),
      platforms: ["ios", "android"],
      context: `## Overview
Voice-activated search functionality using speech-to-text technology.

### Capabilities
- Natural language queries
- Multi-language support (EN, ES, FR)
- Offline mode for basic commands`,
      isActive: true,
    },
  });

  // Add versions for experiments
  await prisma.version.create({
    data: {
      experimentId: exp1.id,
      changeDate: new Date("2024-01-20"),
      changes: `### Version 1.1 Updates
- Fixed payment processing bug for international cards
- Improved mobile responsiveness
- Added error handling for network timeouts`,
    },
  });

  await prisma.version.create({
    data: {
      experimentId: exp1.id,
      changeDate: new Date("2024-02-05"),
      changes: `### Version 1.2 Updates
- Added guest checkout option
- Reduced form validation errors by 30%
- Performance optimizations`,
    },
  });

  await prisma.version.create({
    data: {
      experimentId: exp2.id,
      changeDate: new Date("2024-02-10"),
      changes: `### Version 2.0 Updates
- Upgraded ML model with better accuracy
- Added "Why this recommendation?" explanation
- Improved loading times`,
    },
  });

  await prisma.version.create({
    data: {
      experimentId: exp3.id,
      changeDate: new Date("2024-01-25"),
      changes: `### Version 1.1 Updates
- Fixed contrast issues for accessibility
- Added custom color scheme options
- Improved theme persistence`,
    },
  });

  await prisma.version.create({
    data: {
      experimentId: exp5.id,
      changeDate: new Date("2024-02-20"),
      changes: `### Version 1.1 Updates
- Added support for German and Italian
- Improved voice recognition accuracy
- Fixed background noise filtering`,
    },
  });

  console.log("✅ Database seeded successfully!");
  console.log(`   Created ${await prisma.experiment.count()} experiments`);
  console.log(`   Created ${await prisma.version.count()} versions`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

