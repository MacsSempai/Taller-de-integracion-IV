export const caseDetails = {
    caseName: 'Rotura Piso Flotante',
    description: 'Rotura significativa en el piso flotante de la sala principal.',
    assignedContractor: 'Contratista A',
    inspectorName: 'Inspector Juan Pérez',
    transportationCost: 15,
    sectors: [
      {
        name: 'Sector 1',
        damageType: 'Rasgado',
        lossPercentage: 30,
        totalCost: 200,
        subsectors: [
          {
            material: 'Laminado',
            quantity: 10,
            materialCost: 100,
            workType: 'Instalación',
            workCost: 50
          },
          {
            material: 'Pegamento',
            quantity: 2,
            materialCost: 20,
            workType: 'Reparación',
            workCost: 30
          }
        ]
      },
      {
        name: 'Sector 2',
        damageType: 'Desprendimiento',
        lossPercentage: 20,
        totalCost: 150,
        subsectors: [
          {
            material: 'Piso de repuesto',
            quantity: 5,
            materialCost: 75,
            workType: 'Instalación',
            workCost: 40
          }
        ]
      }
    ]
  };
  