const serviceId = "38f39d38-152e-495b-8c48-28937750d9eb";
const baseUrl = "http://localhost:3333";

async function createRoom(nom, numero) {
  const body = { nom, numero, capacite: 4, serviceId };
  const resp = await fetch(`${baseUrl}/api/salles`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await resp.json();
  console.log(`✓ Salle créée: ${nom} (${numero}) - ID: ${data.id}`);
  return data.id;
}

async function createAppointment(prescriptionId, salleId, medecinId, dateHeureDebut, dateHeureFin) {
  const body = {
    prescriptionId,
    salleId,
    medecinId,
    dateHeureDebut,
    dateHeureFin,
    serviceId,
    statut: "Planifié"
  };
  const resp = await fetch(`${baseUrl}/api/rendezvous`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await resp.json();
  console.log(`✓ Rendez-vous créé`);
  return data.id;
}

async function main() {
  try {
    console.log("=== Création des salles ===");
    const salle1 = await createRoom("Salle Endoscopie 1", "S01");
    const salle2 = await createRoom("Salle Endoscopie 2", "S02");
    
    // Récupérer quelques prescriptions existantes
    console.log("\n=== Récupération des prescriptions ===");
    const prescResp = await fetch(`${baseUrl}/api/prescriptions?serviceId=${serviceId}`);
    const prescriptions = await prescResp.json();
    console.log(`${prescriptions.length} prescriptions trouvées`);
    
    if (prescriptions.length >= 2) {
      console.log("\n=== Création des rendez-vous ===");
      
      // Premier rendez-vous
      const p1 = prescriptions[0];
      const dateHeureDebut1 = "2026-06-22T09:00:00Z";
      const dateHeureFin1 = "2026-06-22T09:30:00Z";
      await createAppointment(p1.id, salle1, p1.medecinId, dateHeureDebut1, dateHeureFin1);
      
      // Deuxième rendez-vous
      const p2 = prescriptions[1];
      const dateHeureDebut2 = "2026-06-22T10:00:00Z";
      const dateHeureFin2 = "2026-06-22T10:30:00Z";
      await createAppointment(p2.id, salle2, p2.medecinId, dateHeureDebut2, dateHeureFin2);
      
      // Troisième rendez-vous
      const p3 = prescriptions[2] || prescriptions[0];
      const dateHeureDebut3 = "2026-06-22T14:00:00Z";
      const dateHeureFin3 = "2026-06-22T14:30:00Z";
      await createAppointment(p3.id, salle1, p3.medecinId, dateHeureDebut3, dateHeureFin3);
    }
    
    console.log("\n✓ Données créées avec succès!");
  } catch(e) {
    console.error("Erreur:", e);
  }
}

main();
