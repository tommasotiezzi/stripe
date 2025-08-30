export default async function handler(req, res) {
  console.log('Webhook received:', req.method);
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const event = req.body;
    
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const organizerId = session.metadata?.organizer_id;
      const tier = session.metadata?.tier || 'basic';
      
      console.log('Processing checkout for:', organizerId, 'tier:', tier);
      
      if (organizerId) {
        const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/organizers?id=eq.${organizerId}`, {
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
        
        if (!response.ok) {
          console.error('Supabase update failed:', response.status);
        }
      }
    }
    
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: error.message });
  }
}
