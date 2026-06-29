const serviceId = "38f39d38-152e-495b-8c48-28937750d9eb";

async function checkData() {
  try {
    // Check salles
    const sallesResp = await fetch(`http://localhost:3333/api/salles?serviceId=${serviceId}`);
    const salles = await sallesResp.json();
    console.log(`✓ ${salles.length} salles trouvées`);
    salles.forEach(s => console.log(`  - ${s.nom} (${s.numero})`));
    
    // Check rendez-vous
    const rdvResp = await fetch(`http://localhost:3333/api/rendezvous?serviceId=${serviceId}`);
    const rdv = await rdvResp.json();
    console.log(`\n✓ ${rdv.length} rendez-vous trouvés`);
    console.log("\nStructure du premier RDV:");
    console.log(JSON.stringify(rdv[0], null, 2).substring(0, 1000));
  } catch(e) {
    console.error("Erreur:", e.message);
    console.error(e);
  }
}

checkData();
