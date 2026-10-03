'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiPost } from '../services/api';
import { CheckCircle2, RefreshCw, X, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function PricingPage() {
  const { user, syncProfile } = useAuth();
  const router = useRouter();
  
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [showCheckoutSuccess, setShowCheckoutSuccess] = useState<string | null>(null);

  const plans = [
    {
      id: 'free',
      name: 'Free Trial',
      description: 'Test the waters of AI decoration styling.',
      price: { monthly: 0, yearly: 0 },
      features: [
        '5 standard designs per month',
        '8 architectural styles available',
        'Standard resolution renderings',
        'Storage limit: 5 projects',
        'Community forum support'
      ]
    },
    {
      id: 'pro',
      name: 'Pro Plan',
      description: 'Ideal for home designers and enthusiasts.',
      price: { monthly: 29, yearly: 290 },
      features: [
        'Unlimited room transformations',
        'HD downloads & print ready renders',
        'All 20+ design themes & custom prompts',
        'Priority queue processing (under 3s)',
        'Saved designs database & project files',
        'Private storage buckets',
        'AI Design Assistant chatbot'
      ]
    },
    {
      id: 'business',
      name: 'Studio Business',
      description: 'Built for interior agencies and real estate stagers.',
      price: { monthly: 89, yearly: 890 },
      features: [
        'Everything in Pro Plan',
        'Team workspaces (up to 5 members)',
        'Custom client layout exports',
        'Before/after slider embedding keys',
        'Premium customer support manager',
        'Early access to new styles & algorithms',
        'Dedicated API access channel'
      ]
    }
  ];

  const [checkoutPlan, setCheckoutPlan] = useState<string | null>(null);
  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (planId === 'free') {
      router.push('/generator');
      return;
    }

    setCheckoutPlan(planId);
    setPaymentError(null);
  };

  const handleProcessCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutPlan) return;
    if (!cardholderName.trim() || !cardNumber.trim() || !expiryDate.trim() || !cvv.trim()) {
      setPaymentError('All payment fields are required.');
      return;
    }

    setSubmittingPayment(true);
    setPaymentError(null);

    try {
      await apiPost('/checkout', {
        plan: checkoutPlan,
        billingCycle,
        cardholderName,
        cardNumber,
        expiryDate,
        cvv
      });

      await syncProfile();
      setShowCheckoutSuccess(checkoutPlan);
      setCheckoutPlan(null);
      // Reset payment fields
      setCardholderName('');
      setCardNumber('');
      setExpiryDate('');
      setCvv('');
    } catch (err: any) {
      console.error('Checkout simulator error:', err);
      setPaymentError(err.message || 'Payment simulation failed. Please make sure the backend is running.');
    } finally {
      setSubmittingPayment(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 35 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 85, damping: 15 } }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      transition={{ duration: 0.5 }}
      className="flex-1 w-full bg-background font-sans py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16"
    >
      
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight font-playfair text-foreground">
          Premium Design Plans
        </h1>
        <p className="max-w-xl mx-auto text-sm sm:text-base text-foreground/60 leading-relaxed font-light">
          Scale your rendering qualities, priority queues, and styling features. No hidden charges.
        </p>

        {/* Billing Toggle Switch */}
        <div className="flex items-center justify-center gap-3 pt-6">
          <span className={`text-xs font-semibold ${billingCycle === 'monthly' ? 'text-primary' : 'text-foreground/50'}`}>
            Monthly
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
            className="w-12 h-6 bg-primary/20 hover:bg-primary/30 rounded-full p-1 transition-colors relative flex items-center cursor-pointer"
          >
            <motion.div
              layout
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="w-4 h-4 bg-primary rounded-full"
              style={{
                marginLeft: billingCycle === 'yearly' ? '24px' : '0px'
              }}
            />
          </button>
          <span className={`text-xs font-semibold flex items-center gap-1.5 ${billingCycle === 'yearly' ? 'text-primary' : 'text-foreground/50'}`}>
            Yearly
            <span className="text-[10px] bg-success/15 text-success font-bold px-1.5 py-0.5 rounded-full uppercase">Save 20%</span>
          </span>
        </div>
      </div>

      {/* Plans Pricing Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        {plans.map((plan) => {
          const isPro = plan.id === 'pro';
          const planPrice = billingCycle === 'monthly' ? plan.price.monthly : plan.price.yearly;
          const billingLabel = billingCycle === 'monthly' ? 'month' : 'year';
          const isActive = user?.subscription?.plan === plan.id;

          return (
            <motion.div
              variants={cardVariants}
              whileHover={{ y: isPro ? -8 : -5, scale: isPro ? 1.02 : 1.01, transition: { duration: 0.2 } }}
              key={plan.id}
              className={`p-8 rounded-3xl bg-background border flex flex-col justify-between relative transition-all duration-300 ${
                isPro 
                  ? 'border-primary ring-2 ring-primary/20 shadow-xl md:scale-105' 
                  : 'border-foreground/5 shadow-sm'
              }`}
            >
              {isPro && (
                <span className="absolute -top-3.5 right-8 px-3.5 py-1 bg-primary text-white text-[10px] uppercase font-bold tracking-widest rounded-full">
                  Recommended
                </span>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold tracking-wide">{plan.name}</h3>
                  <p className="text-xs text-foreground/50 mt-1">{plan.description}</p>
                </div>

                <div className="flex items-baseline gap-1 border-b border-foreground/5 pb-6">
                  <span className="text-5xl font-extrabold font-playfair text-foreground">${planPrice}</span>
                  <span className="text-xs font-semibold text-foreground/45">/ {billingLabel}</span>
                </div>

                {/* Features List */}
                <ul className="space-y-3.5 text-xs text-foreground/80">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSubscribe(plan.id)}
                disabled={isActive}
                className={`w-full mt-10 py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 ${
                  isActive
                    ? 'bg-success/10 text-success border border-success/30 cursor-default'
                    : isPro
                      ? 'bg-primary text-white hover:bg-primary-dark shadow-md shadow-primary/20 hover:shadow-lg'
                      : 'bg-secondary/5 dark:bg-white/5 border border-foreground/10 text-foreground hover:border-primary'
                }`}
              >
                {isActive ? (
                  'Active Plan'
                ) : plan.id === 'free' ? (
                  'Get Started'
                ) : (
                  `Upgrade to ${plan.name.split(' ')[0]}`
                )}
              </motion.button>

            </motion.div>
          );
        })}
      </motion.div>

      {/* PAYMENT METHOD MODAL */}
      <AnimatePresence>
        {checkoutPlan && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setCheckoutPlan(null)}
              className="fixed inset-0 bg-black z-50 cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 30 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-6 rounded-3xl bg-background border border-primary/20 shadow-2xl z-50 space-y-5"
            >
              <div>
                <h3 className="text-xl font-bold font-playfair text-foreground">Secure Payment Checkout</h3>
                <p className="text-xs text-foreground/60 mt-1">Upgrade request for DecorAI {checkoutPlan.toUpperCase()} ({billingCycle})</p>
              </div>

              <form onSubmit={handleProcessCheckout} className="space-y-4 text-sm">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground/75">Cardholder Name</label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                    className="w-full bg-secondary/5 dark:bg-white/5 border border-foreground/10 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-primary text-foreground text-xs"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground/75">Card Number</label>
                  <input
                    type="text"
                    required
                    maxLength={19}
                    placeholder="1234 5678 1234 5678"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-secondary/5 dark:bg-white/5 border border-foreground/10 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-primary text-foreground text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-foreground/75">Expiry Date</label>
                    <input
                      type="text"
                      required
                      maxLength={5}
                      placeholder="MM/YY"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="w-full bg-secondary/5 dark:bg-white/5 border border-foreground/10 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-primary text-foreground text-xs"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-foreground/75">CVV / CVC</label>
                    <input
                      type="password"
                      required
                      maxLength={4}
                      placeholder="•••"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      className="w-full bg-secondary/5 dark:bg-white/5 border border-foreground/10 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-primary text-foreground text-xs"
                    />
                  </div>
                </div>

                {paymentError && (
                  <div className="p-3 rounded-xl bg-danger/10 border border-danger/20 text-xs text-danger">
                    {paymentError}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCheckoutPlan(null)}
                    className="flex-1 py-3 bg-secondary/5 border border-foreground/10 text-foreground text-xs font-semibold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingPayment}
                    className="flex-1 py-3 bg-primary text-white text-xs font-bold rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {submittingPayment ? (
                      <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Processing...</>
                    ) : (
                      'Pay & Request'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* CHECKOUT SUCCESS MODAL */}
      <AnimatePresence>
        {showCheckoutSuccess && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCheckoutSuccess(null)}
              className="fixed inset-0 bg-black z-50 cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 30 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-8 rounded-3xl bg-background border border-primary/20 shadow-2xl z-50 text-center space-y-6"
            >
              <div className="w-16 h-16 rounded-full bg-success/15 border border-success/30 flex items-center justify-center text-success mx-auto">
                <Award className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold font-playfair">Activation Pending!</h3>
                <p className="text-sm text-foreground/65">
                  Thank you! Your payment request for DecorAI **{showCheckoutSuccess.toUpperCase()}** has been submitted.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-secondary/5 dark:bg-white/5 text-xs text-foreground/60 leading-relaxed border">
                Your subscription is currently pending administrator approval. It will become active once approved by the admin team.
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCheckoutSuccess(null)}
                  className="flex-1 py-3 bg-secondary/5 border border-foreground/10 text-foreground text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowCheckoutSuccess(null);
                    router.push('/dashboard');
                  }}
                  className="flex-1 py-3 bg-primary text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Go to Dashboard
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
