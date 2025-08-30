export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const event = req.body;
  
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const organizerId = session.metadata?.organizer_id;
    const tier = session.metadata?.tier || 'basic';
    
    if (organizerId) {
      await fetch(`${process.env.SUPABASE_URL}/rest/v1/organizers?id=eq.${organizerId}`, {
        method: 'PATCH',
        headers: {
          'apikey': process.env.SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          subscription_tier: tier,
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription
        })
      });
    }
  }
  
  res.status(200).json({ received: true });
}