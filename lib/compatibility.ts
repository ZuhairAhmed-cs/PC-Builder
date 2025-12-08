import {
  SelectedComponents,
  CompatibilityResult,
  CompatibilityIssue,
} from "@/types";

export function checkCompatibility(
  build: SelectedComponents
): CompatibilityResult {
  const errors: CompatibilityIssue[] = [];
  const warnings: CompatibilityIssue[] = [];

  if (build.cpu && build.motherboard) {
    if (build.cpu.socketType !== build.motherboard.socketType) {
      errors.push({
        type: "error",
        title: "Socket Mismatch",
        description: `${build.cpu.title} uses ${build.cpu.socketType} socket, but ${build.motherboard.title} has ${build.motherboard.socketType} socket. These are not compatible.`,
        affectedComponents: ["cpu", "motherboard"],
      });
    }
  }

  if (build.motherboard && build.case) {
    const moboFormFactor = build.motherboard.formFactor;
    const caseSupportedFormFactors = build.case.supportedFormFactors || [];

    if (moboFormFactor && !caseSupportedFormFactors.includes(moboFormFactor)) {
      errors.push({
        type: "error",
        title: "Form Factor Mismatch",
        description: `${build.motherboard.title} is ${moboFormFactor}, but ${
          build.case.title
        } only supports ${caseSupportedFormFactors.join(", ")}.`,
        affectedComponents: ["motherboard", "case"],
      });
    }
  }

  if (build.psu) {
    const totalPower = Object.values(build).reduce(
      (sum, component) => sum + (component?.powerRequirement || 0),
      0
    );
    const psuWattage = build.psu.psuWattage || 0;
    const headroom = psuWattage - totalPower;
    const headroomPercent = (headroom / psuWattage) * 100;

    if (totalPower > psuWattage) {
      errors.push({
        type: "error",
        title: "Insufficient Power",
        description: `Your build requires approximately ${totalPower}W, but your PSU only provides ${psuWattage}W. You need a higher wattage power supply.`,
        affectedComponents: ["psu"],
      });
    } else if (headroomPercent < 20) {
      warnings.push({
        type: "warning",
        title: "Low Power Headroom",
        description: `Your build uses ${totalPower}W with a ${psuWattage}W PSU (${Math.round(
          headroomPercent
        )}% headroom). Consider a higher wattage PSU for better efficiency and future upgrades.`,
        affectedComponents: ["psu"],
      });
    }
  }

  if (build.gpu && !build.psu) {
    if (build.gpu.powerRequirement >= 300) {
      warnings.push({
        type: "warning",
        title: "High-Power GPU Needs Strong PSU",
        description: `${build.gpu.title} requires ${build.gpu.powerRequirement}W. Make sure to select a PSU with at least 850W for this GPU.`,
        affectedComponents: ["gpu", "psu"],
      });
    }
  }

  const componentsWithNotes = Object.values(build).filter(
    (c) => c?.compatibilityNotes
  );

  componentsWithNotes.forEach((component) => {
    if (component && component.compatibilityNotes) {
      const psuMatch = component.compatibilityNotes.match(/(\d+)W\s*PSU/i);
      if (psuMatch && build.psu) {
        const requiredWattage = parseInt(psuMatch[1]);
        const psuWattage = build.psu.psuWattage || 0;
        if (psuWattage < requiredWattage) {
          warnings.push({
            type: "warning",
            title: "PSU Recommendation",
            description: `${component.title} recommends at least a ${requiredWattage}W PSU. Your selected PSU is ${psuWattage}W.`,
            affectedComponents: [component.category, "psu"],
          });
        }
      }
    }
  });

  if (build.motherboard && build.ram) {
    const moboSupport = build.motherboard.specifications?.advanced;
    if (moboSupport) {
      const ramSupport = JSON.stringify(moboSupport).toLowerCase();
      const ramType =
        build.ram.specifications?.intermediate?.Type?.toString().toLowerCase();

      if (ramType) {
        if (ramType.includes("ddr5") && !ramSupport.includes("ddr5")) {
          errors.push({
            type: "error",
            title: "RAM Type Mismatch",
            description: `${build.ram.title} is DDR5 memory, but ${build.motherboard.title} only supports DDR4.`,
            affectedComponents: ["ram", "motherboard"],
          });
        } else if (
          ramType.includes("ddr4") &&
          ramSupport.includes("ddr5") &&
          !ramSupport.includes("ddr4")
        ) {
          errors.push({
            type: "error",
            title: "RAM Type Mismatch",
            description: `${build.ram.title} is DDR4 memory, but ${build.motherboard.title} only supports DDR5.`,
            affectedComponents: ["ram", "motherboard"],
          });
        }
      }
    }
  }

  return {
    isCompatible: errors.length === 0,
    errors,
    warnings,
  };
}

export function checkComponentCompatibility(
  category: string,
  component: { socketType?: string; formFactor?: string },
  build: SelectedComponents
): { compatible: boolean; reason?: string } {
  switch (category) {
    case "cpu":
      if (
        build.motherboard &&
        component.socketType !== build.motherboard.socketType
      ) {
        return {
          compatible: false,
          reason: `Socket ${component.socketType} doesn't match motherboard socket ${build.motherboard.socketType}`,
        };
      }
      break;
    case "motherboard":
      if (build.cpu && component.socketType !== build.cpu.socketType) {
        return {
          compatible: false,
          reason: `Socket ${component.socketType} doesn't match CPU socket ${build.cpu.socketType}`,
        };
      }
      if (build.case && component.formFactor) {
        const supported = build.case.supportedFormFactors || [];
        if (!supported.includes(component.formFactor)) {
          return {
            compatible: false,
            reason: `${component.formFactor} form factor doesn't fit in selected case`,
          };
        }
      }
      break;
  }

  return { compatible: true };
}
