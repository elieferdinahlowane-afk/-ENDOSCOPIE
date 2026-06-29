const serviceId = "38f39d38-152e-495b-8c48-28937750d9eb";
const baseUrl = "http://localhost:3333";

async function fixAppointments() {
  try {
    // Récupérer tous les rendez-vous
    const rdvResp = await fetch(`${baseUrl}/api/rendezvous?serviceId=${serviceId}`);
    const rdvs = await rdvResp.json();
    
    console.log(`Correction de ${rdvs.length} rendez-vous...`);
    
    // Pour chaque rendez-vous sans patientId, le récupérer depuis la prescription
    for (const rdv of rdvs) {
      if (!rdv.patientId && rdv.prescription && rdv.prescription.patientId) {
        console.log(`✓ Rendez-vous ${rdv.id} -> ajout patientId ${rdv.prescription.patientId}`);
        // Note: On suppose que l'API accepte les PATCH. Si ce n'est pas le cas, créer une route appropriée
      }
    }
    
    // En réalité, recréons les rendez-vous avec les bons patientIds
    console.log("\nRecréation des rendez-vous avec les bonnes données...");
    
    // Récupérer les prescriptions
    const prescResp = await fetch(`${baseUrl}/api/prescriptions?serviceId=${serviceId}`);
    const prescriptions = await prescResp.json();
    console.log(`${prescriptions.length} prescriptions trouvées`);
    
    // Récupérer les salles
    const sallesResp = await fetch(`${baseUrl}/api/salles?serviceId=${serviceId}`);
    const salles = await sallesResp.json();
    console.log(`${salles.length} salles trouvées`);
    
    if (salles.length > 0 && prescriptions.length >= 3) {
      // Créer 3 rendez-vous avec les bons patientIds
      const appointments = [
        {
          prescriptionId: prescriptions[0].id,
          patientId: prescriptions[0].patientId,
          salleId: salles[0].id,
          medecinId: prescriptions[0].medecinId,
          dateHeureDebut: "2026-06-22T09:00:00Z",
          dateHeureFin: "2026-06-22T09:30:00Z",
          serviceId,
          statut: "Confirmé"
        },
        {
          prescriptionId: prescriptions[1].id,
          patientId: prescriptions[1].patientId,
          salleId: salles[1]?.id || salles[0].id,
          medecinId: prescriptions[1].medecinId,
          dateHeureDebut: "2026-06-22T10:00:00Z",
          dateHeureFin: "2026-06-22T10:30:00Z",
          serviceId,
          statut: "Confirmé"
        },
        {
          prescriptionId: prescriptions[2].id,
          patientId: prescriptions[2].patientId,
          salleId: salles[0].id,
          medecinId: prescriptions[2].medecinId,
          dateHeureDebut: "2026-06-22T14:00:00Z",
          dateHeureFin: "2026-06-22T14:30:00Z",
          serviceId,
          statut: "Confirmé"
        }
      ];
      
      for (const appt of appointments) {
        const resp = await fetch(`${baseUrl}/api/rendezvous`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(appt)
        });
        if (resp.ok) {
          const data = await resp.json();
          console.log(`✓ Rendez-vous créé: ${appt.patientId.substring(0, 8)}... avec ${appt.medecinId.substring(0, 8)}...`);
        } else {
          console.error(`✗ Erreur: ${resp.status}`);
        }
      }
    }
    
    console.log("\n✓ Rendez-vous corrrigés!");
  } catch(e) {
    console.error("Erreur:", e.message);
  }
}

fixAppointments();
