import { db } from './database.js';

async function testRecurrence() {
  const srv = db.getServices()[0];

  const payload = {
    service_id: srv.id,
    date: '2026-09-01',
    time: '15:00',
    client_name: 'Ana Belén Martínez',
    client_address: 'Av. Libertador 4500',
    client_phone: '11 4444 8888',
    client_notes: 'Plan mensual recurrente',
    source: 'admin',
    recurrence: {
      enabled: true,
      type: 'weekly',
      count: 4,
      interval: 1
    }
  };

  const response = await fetch('http://localhost:3000/api/appointments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const res = await response.json();
  console.log('Status:', response.status);
  console.log('Mensaje:', res.message);
  console.log('Total agendados:', res.total_booked);
  console.log('Series ID:', res.series_id);
  console.log('Fechas agendadas:');
  res.appointments?.forEach(a => {
    console.log(` - ID: ${a.id} | Fecha: ${a.date} a las ${a.time} hs | Regla: ${a.recurrence_rule}`);
  });

  if (res.total_booked !== 4) {
    throw new Error('No se agendaron las 4 sesiones');
  }

  console.log('\n🎉 ¡Prueba de recurrencia exitosa!');
}

testRecurrence().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
