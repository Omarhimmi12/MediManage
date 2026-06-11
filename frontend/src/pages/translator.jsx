import { useCallback, useEffect, useMemo, useState } from 'react';

export const LANG_STORAGE_KEY = 'mediManage_lang';

export const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'French', flag: '🇫🇷' },
  { code: 'ar', label: 'Arabic', flag: '🇲🇦' },
];


export const dict = {
  en: {
    'nav.features': 'Features',
    'nav.how': 'How It Works',
    'nav.pricing': 'Pricing',
    'nav.reviews': 'Reviews',
    'nav.login': 'Log In',
    'nav.whyUs': 'Why us',
    'nav.contact': 'Contact',
    'nav.getStarted': 'Get Started',

    'mobile.openMenu': 'Open menu',
    'hero.title.part1': 'Simplify, secure,',
    'hero.title.part2': 'and optimize your healthcare management.',
    'hero.subtitle': 'Automate appointments, manage patients, track revenue — all in one beautiful platform built for modern healthcare teams.',
    'hero.cta.primary': 'Get Started Free',
    'hero.cta.secondary': 'Contact Us',
    'hero.trust.rating': '4.9/5',
    'hero.trust.text': 'from 1,200+ reviews',

    'social.proof.text': 'Trusted by innovative healthcare teams worldwide',
    'social.proof.clinic1': 'Atlas Santé',
    'social.proof.clinic2': 'Al Amal',
    'social.proof.clinic3': 'Ibn Sina',
    'social.proof.clinic4': 'Riad Santé',
    'social.proof.clinic5': 'Safa Médical',

    'features.label': 'Features',
    'features.title': 'Everything your clinic needs',
    'features.subtitle': 'A comprehensive toolkit designed to streamline every aspect of clinic management — from scheduling to analytics.',

    'features.smart.title': 'Smart Scheduling',
    'features.smart.desc': 'AI-powered appointment booking with automated reminders, waitlist management, and real-time availability sync across your entire team.',
    'features.patient.title': 'Patient Management',
    'features.patient.desc': 'Complete patient profiles with medical history, documents, prescriptions, and communication logs — all in one secure place.',
    'features.rx.title': 'E-Prescriptions',
    'features.rx.desc': 'Generate, send, and track prescriptions digitally. Integrated drug databases with interaction alerts and refill notifications.',
    'features.revenue.title': 'Revenue Analytics',
    'features.revenue.desc': 'Real-time dashboards showing revenue trends, billing insights, insurance claims status, and financial forecasting tools.',
    'features.team.title': 'Team Collaboration',
    'features.team.desc': 'Role-based access, internal messaging, shift management, and task assignment — keep your entire staff in sync.',
    'features.notif.title': 'Smart Notifications',
    'features.notif.desc': 'Automated SMS & email reminders for appointments, follow-ups, and prescription refills. Reduce no-shows by 60%.',

    'how.label': 'How It Works',
    'how.title': 'Up and running in minutes',
    'how.subtitle': "Three simple steps to transform your clinic's operations. No complex setup, no learning curve.",

    'how.step1.title': 'Create Your Clinic',
    'how.step1.desc': 'Sign up in 30 seconds. Add your clinic details, staff members, and customize your settings. We handle the rest.',
    'how.step2.title': 'Import & Configure',
    'how.step2.desc': 'Import existing patient data, set up appointment types, configure notifications, and connect your payment gateway.',
    'how.step3.title': 'Go Live & Grow',
    'how.step3.desc': 'Start accepting appointments, managing patients, and tracking revenue. Watch your efficiency soar from day one.',

    'stats.label': 'By the Numbers',
    'stats.title': 'Powering healthcare at scale',
    'stats.subtitle': 'Real results from real clinics around the world.',
    'stats.clinics': 'Clinics Worldwide',
    'stats.satisfaction': 'Satisfaction Rate',
    'stats.appointments': 'Appointments Managed',
    'stats.countries': 'Countries Served',

    'pricing.label': 'Pricing',
    'pricing.title': 'Simple, transparent pricing',
    'pricing.subtitle': 'Start free, scale as you grow. No hidden fees, no surprises. Cancel anytime.',

    'pricing.starter.name': 'Starter',
    'pricing.starter.desc': 'Perfect for solo practitioners',
    'pricing.starter.price': '0',
    'pricing.starter.period': '/month',
    'pricing.starter.cta': 'Get Started Free',

    'pricing.pro.name': 'Professional',
    'pricing.pro.desc': 'For growing clinics',
    'pricing.pro.price': '49',
    'pricing.pro.period': '/month',
    'pricing.pro.cta': 'Start Free Trial',

    'pricing.enterprise.name': 'Enterprise',
    'pricing.enterprise.desc': 'For large healthcare networks',
    'pricing.enterprise.price': '149',
    'pricing.enterprise.period': '/month',
    'pricing.enterprise.cta': 'Contact Sales',
    'pricing.popular.badge': 'Most Popular',

    'problem.label': 'The Problem',
    'problem.title': 'Healthcare teams are drowning in administrative chaos',
    'problem.lead': 'Every day, clinicians lose precious hours to fragmented systems, manual data entry, and disconnected workflows. The result is not just inefficiency — it is burnout, billing errors, and compromised patient care.',
    'problem.item1': 'Fragmented patient records across multiple systems',
    'problem.item2': 'Billing errors costing thousands each month',
    'problem.item3': 'Missed appointments and scheduling conflicts',
    'problem.item4': 'Compliance stress and audit anxiety',
    'problem.item5': 'Staff burnout from repetitive admin tasks',

    'testimonials.label': 'Testimonials',
    'testimonials.title': 'Loved by healthcare teams',
    'testimonials.subtitle': 'See why thousands of clinics switched to MediManage and never looked back.',

    'testimonial1.text': '"MediManage cut our admin time by 60%. The scheduling system alone saved us 20 hours a week. Our patients love the automated reminders — no-shows dropped dramatically."',
    'testimonial1.name': 'Dr. Asmae BERRADA',
    'testimonial1.role': 'Founder, Berrada Family Practice',
    'testimonial2.text': '"The analytics dashboard is incredible. We can finally see which services drive revenue and where we\'re losing money. It paid for itself in the first month."',
    'testimonial2.name': 'Dr. Karim DAHBI',
    'testimonial2.role': 'Director, Atlas Santé Clinics',
    'testimonial3.text': '"We evaluated 12 clinic management tools before choosing MediManage. The UX is leagues ahead of everything else. Onboarding our 30-person staff took just one day."',
    'testimonial3.name': 'Youssra BEN JELLOUN',
    'testimonial3.role': 'COO, Wellness Partners Group',

    'cta.title.part1': 'Ready to modernize',
    'cta.title.part2': 'your clinic?',
    'cta.subtitle': 'Join 2,500+ clinics already saving time and growing revenue with MediManage. Start your free trial today — no credit card required.',
    'cta.primary': 'Get Started →',
    'cta.secondary': 'Contact Us',

    'footer.product': 'Product',
    'footer.company': 'Company',
    'footer.resources': 'Resources',

    'footer.features': 'Features',
    'footer.pricing': 'Pricing',
    'footer.integrations': 'Integrations',
    'footer.changelog': 'Changelog',
    'footer.apiDocs': 'API Docs',

    'footer.about': 'About',
    'footer.blog': 'Blog',
    'footer.careers': 'Careers',
    'footer.press': 'Press',
    'footer.contact': 'Contact',
    'footer.subscribe.title': 'Subscribe to our newsletter',
    'footer.subscribe.button': 'Subscribe',


    'footer.helpCenter': 'Help Center',
    'footer.community': 'Community',
    'footer.webinars': 'Webinars',
    'footer.security': 'Security',
    'footer.hipaa': 'HIPAA Compliance',

    'footer.desc': 'The all-in-one clinic management platform built for modern healthcare teams. Streamline operations, delight patients, and grow your practice.',

    'footer.legal.privacy': 'Privacy Policy',
    'footer.legal.terms': 'Terms of Service',
    'footer.legal.cookie': 'Cookie Policy',

    // Floating dashboard + social proof labels
    'float.schedule.title': "Today's Schedule",
    'float.schedule.badge': '4 left',
    'float.patient.title': 'Patient Overview',
    'float.revenue.title': 'Revenue',
    'float.revenue.change': '↑ 24%',
    'float.notif.title': 'Notifications',
    'float.analytics.title': 'Patients This Week',
    
    'social.proof.stat1': 'Active clinics',
    'social.proof.stat2': 'Patients managed',
    'social.proof.stat3': 'Uptime SLA',
    'social.proof.stat4': 'Average rating',
    'float.notif.item1': 'Appointment confirmed for 2:30 PM',
    'float.notif.item2': 'Lab results ready',
    'float.notif.item3': 'Prescription renewal pending',

    'float.appt.sarah': 'Kaoutar El mghari',
    'float.appt.michael': 'Youssef Kamal',
    'float.appt.emily': 'Mohamed Saidi',
    'float.appt.t1': '9:00 AM — Check-up',
    'float.appt.t2': '10:30 AM — Follow-up',
    'float.appt.t3': '1:00 PM — Consultation',

    'float.patient.name': 'Kaoutar El mghari',
    'float.patient.meta': 'Female • 34 yrs',
    'float.patient.visits': 'Visits',
    'float.patient.rx': 'Rx Active',

    'float.analytics.value': '284',
    'float.analytics.sub': '↑ 12% vs last week',
    'float.revenue.amount': '$48,290',

    'footer.copyright': '© 2026 MediManage. All rights reserved.',

    // Contact us
    'contact.label': 'Get in Touch',
    'contact.title': 'Ready to improve your clinic?',
    'contact.subtitle': 'Tell us what you need. We’ll get back to you quickly to schedule a demo or answer your questions.',

    'contact.email.label': 'Email Us',
    'contact.email.value': 'support@medimanage.com',
    'contact.phone.label': 'Call Us',
    'contact.phone.value': '+212 6 22 55 00 10',
    'contact.hours.label': 'Business Hours',
    'contact.hours.value': 'Mon-Fri: 9AM - 6PM',

    'contact.trust.ariaLabel': 'Trust indicators',
    'contact.trust.hipaa': 'HIPAA Compliant',
    'contact.trust.encryption': '256-bit Encryption',
    'contact.trust.response': '24hr Response Time',

    'contact.methods.ariaLabel': 'Contact methods',

    'contact.form.ariaLabel': 'Contact form',
    'contact.form.requiredHint': 'Required field',
    'contact.form.name': 'Full Name',
    'contact.form.name.placeholder': 'Mohamed Mohamed',
    'contact.form.email': 'Email Address',
    'contact.form.email.placeholder': 'mohamed@example.com',
    'contact.form.phone': 'Phone Number',
    'contact.form.phone.placeholder': '+212 6 00 00 00 00',
    'contact.form.org': 'Clinic/Organization',
    'contact.form.org.placeholder': 'Your clinic name',
    "contact.form.subject": "I'm interested in",
    'contact.form.message': 'Message',
    'contact.form.message.placeholder': 'Tell us about your clinic and how we can help...',
    'contact.form.newsletter': 'Send me healthcare management tips and product updates',

    'contact.form.submit': 'Send Message',
    'contact.form.sending': 'Sending...',
    'contact.form.privacy.part1': 'By submitting this form, you agree to our',
    'contact.form.privacy.privacyPolicy': 'Privacy Policy',
    'contact.form.privacy.part2': 'and',
    'contact.form.privacy.termsOfService': 'Terms of Service.',

    'contact.subject.default': 'Select a topic...',
    'contact.subject.demo': 'Schedule a Demo',
    'contact.subject.pricing': 'Pricing Information',
    'contact.subject.support': 'Technical Support',
    'contact.subject.partnership': 'Partnership Opportunities',
    'contact.subject.other': 'Other Inquiry',

    'contact.success.title': 'Message Sent Successfully!',
    'contact.success.text': "Thank you for contacting us. We'll get back to you within 24 hours.",

    'contact.error.submit': 'Something went wrong. Please try again.',
    'contact.error.name': 'Name is required',
    'contact.error.email': 'Valid email is required',
    'contact.error.subject': 'Please select a topic',
    'contact.error.message': 'Message must be at least 10 characters',

    'contact.name': 'Your name',
    'contact.email': 'Email address',
    'contact.message': 'Message',
    'contact.submit': 'Send message',
    'contact.success': "Message sent! We'll reach out shortly.",
  },

  fr: {
    'nav.features': 'Fonctionnalités',
    'nav.how': 'Comment ça marche',
    'nav.pricing': 'Tarifs',
    'nav.reviews': 'Avis',
    'nav.whyUs': 'Pourquoi nous',
    'nav.contact': 'Contact',
    'nav.login': 'Connexion',
    'nav.getStarted': 'Commencer',

    'mobile.openMenu': 'Ouvrir le menu',

    'hero.title.part1': 'Simplifiez, sécurisez',
    'hero.title.part2': 'optimisez votre gestion de santé.',
    'hero.subtitle': "Automatisez les rendez-vous, gérez les patients et suivez votre chiffre d'affaires — le tout dans une plateforme élégante, pensée pour les équipes de santé modernes.",
    'hero.cta.primary': 'Commencer gratuitement',
    'hero.cta.secondary': 'Nous contacter',
    'hero.trust.rating': '4,9/5',
    'hero.trust.text': "d'après 1 200+ avis",

    'social.proof.text': 'Approuvé par des équipes de santé innovantes à travers le Maroc',

    'social.proof.clinic1': 'Atlas Santé',
    'social.proof.clinic2': 'Al Amal',
    'social.proof.clinic3': 'Ibn Sina',
    'social.proof.clinic4': 'Riad Santé',
    'social.proof.clinic5': 'Safa Médical',

    'features.label': 'Fonctionnalités',
    'features.title': 'Tout ce dont votre clinique a besoin',
    'features.subtitle': "Un ensemble complet d'outils conçu pour simplifier chaque aspect de la gestion — de la planification à l'analyse.",

    'features.smart.title': 'Planification intelligente',
    'features.smart.desc': "Réservation de rendez-vous assistée par IA avec rappels automatisés, gestion de liste d'attente et synchronisation temps réel de la disponibilité pour toute votre équipe.",
    'features.patient.title': 'Gestion des patients',
    'features.patient.desc': 'Profils complets des patients avec historique médical, documents, prescriptions et journaux de communication — le tout au même endroit, en toute sécurité.',
    'features.rx.title': 'Ordonnances électroniques',
    'features.rx.desc': "Créez, envoyez et suivez vos prescriptions numériquement. Bases de données médicaments intégrées avec alertes d'interactions et notifications de renouvellement.",
    'features.revenue.title': 'Analytique des revenus',
    'features.revenue.desc': "Des tableaux de bord en temps réel pour suivre les tendances de revenus, les informations de facturation, le statut des demandes d'assurance et la prévision financière.",
    'features.team.title': "Collaboration d'équipe",
    'features.team.desc': "Accès selon les rôles, messagerie interne, gestion des horaires et attribution des tâches — pour garder tout le personnel aligné.",
    'features.notif.title': 'Notifications intelligentes',
    'features.notif.desc': "Rappels SMS & e-mail automatisés pour les rendez-vous, suivis et renouvellements d'ordonnances. Réduisez les absences non justifiées de 60%.",

    'how.label': 'Comment ça marche',
    'how.title': 'En ligne en quelques minutes',
    'how.subtitle': "Trois étapes simples pour transformer vos opérations. Aucun paramétrage complexe, aucune courbe d'apprentissage.",

    'how.step1.title': 'Créez votre clinique',
    'how.step1.desc': "Inscrivez-vous en 30 secondes. Ajoutez les détails de votre clinique, votre équipe et personnalisez vos paramètres. On s'occupe du reste.",
    'how.step2.title': 'Importez et configurez',
    'how.step2.desc': 'Importez vos données patients existantes, définissez les types de rendez-vous, configurez les notifications et connectez votre passerelle de paiement.',
    'how.step3.title': 'Mettez en ligne et développez',
    'how.step3.desc': "Commencez à accepter les rendez-vous, gérer les patients et suivre vos revenus. Observez votre efficacité s'envoler dès le premier jour.",

    'stats.label': 'Les chiffres clés',
    'stats.title': 'Des résultats à grande échelle',
    'stats.subtitle': 'Des retours concrets provenant de cliniques du monde entier.',
    'stats.clinics': 'Cliniques dans le monde',
    'stats.satisfaction': 'Taux de satisfaction',
    'stats.appointments': 'Rendez-vous gérés',
    'stats.countries': 'Pays couverts',

    'pricing.label': 'Tarifs',
    'pricing.title': 'Des prix simples et transparents',
    'pricing.subtitle': 'Commencez gratuitement, puis adaptez-vous en grandissant. Aucun frais caché, aucune surprise. Annulez quand vous voulez.',

    'pricing.starter.name': 'Starter',
    'pricing.starter.desc': 'Idéal pour les praticiens en solo',
    'pricing.starter.price': '0',
    'pricing.starter.period': '/mois',
    'pricing.starter.cta': 'Commencer gratuitement',

    'pricing.pro.name': 'Professional',
    'pricing.pro.desc': 'Pour les cliniques en croissance',
    'pricing.pro.price': '49',
    'pricing.pro.period': '/mois',
    'pricing.pro.cta': "Démarrer l'essai gratuit",

    'pricing.enterprise.name': 'Enterprise',
    'pricing.enterprise.desc': 'Pour les grands réseaux de santé',
    'pricing.enterprise.price': '149',
    'pricing.enterprise.period': '/mois',
    'pricing.enterprise.cta': 'Contacter les ventes',
    'pricing.popular.badge': 'Le plus populaire',

    'problem.label': 'Le problème',
    'problem.title': 'Les équipes de santé sont submergées par le chaos administratif',
    'problem.lead': "Chaque jour, les cliniciens perdent des heures précieuses à cause de systèmes fragmentés, de saisie manuelle de données et de flux de travail déconnectés. Le résultat n'est pas seulement l'inefficacité — c'est l'épuisement, les erreurs de facturation et des soins aux patients compromis.",
    'problem.item1': 'Dossiers patients fragmentés sur plusieurs systèmes',
    'problem.item2': 'Erreurs de facturation coûtant des milliers chaque mois',
    'problem.item3': 'Rendez-vous manqués et conflits de planification',
    'problem.item4': "Stress de conformité et anxiété d'audit",
    'problem.item5': 'Épuisement du personnel dû aux tâches administratives répétitives',

    'testimonials.label': 'Témoignages',
    'testimonials.title': 'Adoré par les équipes de santé',
    'testimonials.subtitle': 'Découvrez pourquoi des milliers de cliniques ont choisi MediManage — et ne sont jamais revenues en arrière.',

    'testimonial1.text': '"MediManage a réduit notre charge administrative de 60%. Le système de planning seul nous a fait gagner 20 heures par semaine. Nos patients adorent les rappels automatiques — les absences non justifiées ont fortement diminué."',
    'testimonial1.name': 'Dr. Asmae BERRADA',
    'testimonial1.role': 'Fondatrice, Berrada Family Practice',
    'testimonial2.text': "\"Le tableau de bord d'analytique est incroyable. Nous voyons enfin quels services génèrent des revenus et où nous perdons de l'argent. Il s'est rentabilisé dès le premier mois.\"",
    'testimonial2.name': 'Dr. Karim DAHBI',
    'testimonial2.role': 'Directeur, Atlas Santé Clinics',
    'testimonial3.text': "\"Nous avons évalué 12 outils de gestion de clinique avant de choisir MediManage. L'UX est au-delà de tout le reste. Former 30 membres de notre équipe a pris seulement une journée.\"",
    'testimonial3.name': 'Youssra BEN JELLOUN',
    'testimonial3.role': 'Directrice des opérations, Wellness Partners Group',

    'cta.title.part1': 'Prêt à moderniser',
    'cta.title.part2': 'votre clinique ?',
    'cta.subtitle': "Rejoignez 2 500+ cliniques qui gagnent du temps et développent leurs revenus avec MediManage. Lancez votre essai gratuit dès aujourd'hui — aucune carte bancaire requise.",
    'cta.primary': 'Commencer gratuitement →',
    'cta.secondary': 'Nous contacter',

    'footer.product': 'Produit',
    'footer.company': 'Entreprise',
    'footer.resources': 'Ressources',

    'footer.features': 'Fonctionnalités',
    'footer.pricing': 'Tarifs',
    'footer.integrations': 'Intégrations',
    'footer.changelog': 'Journal des changements',
    'footer.apiDocs': 'Docs API',

    'footer.about': 'À propos',
    'footer.blog': 'Blog',
    'footer.careers': 'Carrières',
    'footer.press': 'Presse',
    'footer.contact': 'Contact',
    'footer.subscribe.title': 'S’abonner à la newsletter',
    'footer.subscribe.button': 'S’abonner',


    'footer.helpCenter': "Centre d'aide",
    'footer.community': 'Communauté',
    'footer.webinars': 'Webinaires',
    'footer.security': 'Sécurité',
    'footer.hipaa': 'Conformité HIPAA',

    'footer.desc': "La plateforme tout-en-un de gestion de clinique, conçue pour les équipes de santé modernes. Rationalisez vos opérations, ravissez vos patients et développez votre activité.",

    'footer.legal.privacy': 'Politique de confidentialité',
    'footer.legal.terms': "Conditions d'utilisation",
    'footer.legal.cookie': 'Politique relative aux cookies',

    'float.schedule.title': 'Planning du jour',
    'float.schedule.badge': '4 restants',
    'float.patient.title': 'Aperçu patient',
    'float.revenue.title': 'Revenus',
    'float.revenue.change': '↑ 24%',
    'float.notif.title': 'Notifications',
    'float.analytics.title': 'Patients cette semaine',
    'social.proof.stat1': 'Cliniques actives',
    'social.proof.stat2': 'Patients gérés',
    'social.proof.stat3': 'SLA de disponibilité',
    'social.proof.stat4': 'Note moyenne',
    'float.notif.item1': 'Rendez-vous confirmé pour 14:30',
    'float.notif.item2': 'Résultats de laboratoire prêts',
    'float.notif.item3': "Renouvellement d'ordonnance en attente",

    'float.appt.sarah': 'Kaoutar El mghari',
    'float.appt.michael': 'Youssef Kamal',
    'float.appt.emily': 'Mohamed Saidi',
    'float.appt.t1': '9:00 — Consultation',
    'float.appt.t2': '10:30 — Suivi',
    'float.appt.t3': '13:00 — Consultation',

    'float.patient.name': 'Kaoutar El mghari',
    'float.patient.meta': 'Femme • 34 ans',
    'float.patient.visits': 'Visites',
    'float.patient.rx': 'Ordonnances actives',

    'float.analytics.value': '284',
    'float.analytics.sub': '↑ 12% vs la semaine dernière',
    'float.revenue.amount': '$48,290',

    'footer.copyright': '© 2026 MediManage. Tous droits réservés.',

    // Contact
    'contact.label': 'Contactez-nous',
    'contact.title': 'Prêt à améliorer votre clinique ?',
    'contact.subtitle': 'Dites-nous ce dont vous avez besoin. Nous vous répondrons rapidement pour planifier une démo ou répondre à vos questions.',

    'contact.email.label': 'Email',
    'contact.email.value': 'support@medimanage.com',
    'contact.phone.label': 'Téléphone',
    'contact.phone.value': '+212 6 22 55 00 10',
    'contact.hours.label': 'Horaires',
    'contact.hours.value': 'Lun-Ven : 9h - 18h',

    'contact.trust.ariaLabel': 'Indicateurs de confiance',
    'contact.trust.hipaa': 'Conforme HIPAA',
    'contact.trust.encryption': 'Chiffrement 256 bits',
    'contact.trust.response': 'Réponse sous 24h',

    'contact.methods.ariaLabel': 'Méthodes de contact',

    'contact.form.ariaLabel': 'Formulaire de contact',
    'contact.form.requiredHint': 'Champ obligatoire',
    'contact.form.name': 'Nom complet',
    'contact.form.name.placeholder': 'Mohamed Mohamed',
    'contact.form.email': 'Adresse email',
    'contact.form.email.placeholder': 'mohamed@example.com',
    'contact.form.phone': 'Numéro de téléphone',
    'contact.form.phone.placeholder': '+212 6 00 00 00 00',
    'contact.form.org': 'Clinique / Organisation',
    'contact.form.org.placeholder': 'Nom de votre clinique',
    'contact.form.subject': "Je suis intéressé par",
    'contact.form.message': 'Message',
    'contact.form.message.placeholder': 'Parlez-nous de votre clinique et de vos besoins...',
    'contact.form.newsletter': 'Recevoir des conseils de gestion médicale et les mises à jour produit',

    'contact.form.submit': 'Envoyer le message',
    'contact.form.sending': 'Envoi en cours...',
    'contact.form.privacy.part1': "En soumettant ce formulaire, vous acceptez notre",
    'contact.form.privacy.privacyPolicy': 'Politique de confidentialité',
    'contact.form.privacy.part2': 'et nos',
    'contact.form.privacy.termsOfService': "Conditions d’utilisation.",

    'contact.subject.default': 'Choisissez un sujet...',
    'contact.subject.demo': 'Planifier une démo',
    'contact.subject.pricing': 'Informations sur les prix',
    'contact.subject.support': 'Support technique',
    'contact.subject.partnership': 'Partenariats',
    'contact.subject.other': 'Autre demande',

    'contact.success.title': 'Message envoyé avec succès !',
    'contact.success.text': 'Merci de nous avoir contactés. Nous vous répondrons sous 24 heures.',

    'contact.error.submit': 'Une erreur est survenue. Veuillez réessayer.',
    'contact.error.name': 'Le nom est requis',
    'contact.error.email': 'Un email valide est requis',
    'contact.error.subject': 'Veuillez sélectionner un sujet',
    'contact.error.message': 'Le message doit contenir au moins 10 caractères',

    'contact.name': 'Votre nom',
    'contact.email': 'Adresse email',
    'contact.message': 'Message',
    'contact.submit': 'Envoyer le message',
    'contact.success': 'Message envoyé ! Nous vous contacterons bientôt.',
  },

  ar: {
    'nav.features': 'الميزات',
    'nav.how': 'كيف تعمل',
    'nav.pricing': 'الأسعار',
    'nav.reviews': 'آراء',
    'nav.whyUs': 'لماذا نحن',
    'nav.contact': 'اتصل بنا',
    'nav.login': 'تسجيل الدخول',
    'nav.getStarted': 'ابدأ',

    'mobile.openMenu': 'افتح القائمة',

    'hero.title.part1': 'بسّط، أمّن',
    'hero.title.part2': 'وحسّن إدارة مؤسستك الصحية',
    'hero.subtitle': 'أتمتة المواعيد، إدارة المرضى، وتتبع الإيرادات — في منصة واحدة أنيقة مصممة خصيصًا لفرق الرعاية الصحية الحديثة.',
    'hero.cta.primary': 'ابدأ مجانًا',
    'hero.cta.secondary': 'تواصل معنا',
    'hero.trust.rating': '4.9/5',
    'hero.trust.text': 'من 1200+ تقييم',

    'social.proof.text': 'موثوق به من طرف فرق طبية مبتكرة في جميع أنحاء المغرب',

    'social.proof.clinic1': 'مصحة الأطلس للصحة',
    'social.proof.clinic2': 'مصحة الأمل',
    'social.proof.clinic3': 'مصحة ابن سينا',
    'social.proof.clinic4': 'مصحة رياض الصحة',
    'social.proof.clinic5': 'مصحة الصفا الطبية',
    'features.label': 'الميزات',
    'features.title': 'كل ما تحتاجه عيادتك',
    'features.subtitle': 'مجموعة أدوات شاملة لتبسيط كل جانب من إدارة العيادة — من الجدولة إلى التحليلات.',

    'features.smart.title': 'جدولة ذكية',
    'features.smart.desc': 'حجز المواعيد بالذكاء الاصطناعي مع تذكيرات آلية وإدارة قائمة الانتظار ومزامنة توفر الوقت بشكل لحظي عبر فريقك بالكامل.',
    'features.patient.title': 'إدارة المرضى',
    'features.patient.desc': 'سجلات مرضى كاملة تشمل التاريخ الطبي والوثائق والوصفات وسجلات التواصل — في مكان واحد آمن.',
    'features.rx.title': 'وصفات إلكترونية',
    'features.rx.desc': 'أنشئ الوصفات وأرسلها وتتبعها رقميًا. قواعد بيانات للأدوية مدمجة مع تنبيهات التداخلات وإشعارات التجديد.',
    'features.revenue.title': 'تحليلات الإيرادات',
    'features.revenue.desc': 'لوحات تحكم فورية تُظهر اتجاهات الإيرادات، رؤى الفوترة، حالة مطالبات التأمين، وأدوات التنبؤ المالي.',
    'features.team.title': 'تعاون الفريق',
    'features.team.desc': 'صلاحيات حسب الدور، رسائل داخلية، إدارة المناوبات وتوزيع المهام — ليبقى فريقك كله متزامنًا.',
    'features.notif.title': 'إشعارات ذكية',
    'features.notif.desc': 'تذكيرات SMS والبريد الإلكتروني آلية للمواعيد والمتابعات وتجديد الوصفات. قلل الإلغاءات بنسبة 60%.',

    'how.label': 'كيف تعمل',
    'how.title': 'جاهز خلال دقائق',
    'how.subtitle': 'ثلاث خطوات بسيطة لتحويل عمليات عيادتك. لا إعدادات معقدة، ولا منحنى تعلم.',

    'how.step1.title': 'أنشئ عيادتك',
    'how.step1.desc': 'سجّل في 30 ثانية. أضف تفاصيل العيادة وأفراد فريقك وخصص إعداداتك. نحن نهتم بالباقي.',
    'how.step2.title': 'استورد وتهيئة',
    'how.step2.desc': 'استورد بيانات المرضى الحالية، وحدد أنواع المواعيد، وقم بإعداد الإشعارات وربط بوابة الدفع.',
    'how.step3.title': 'انشر وازدد نموًا',
    'how.step3.desc': 'ابدأ باستقبال المواعيد وإدارة المرضى وتتبع الإيرادات. شاهد كفاءتك ترتفع من اليوم الأول.',

    'stats.label': 'الأرقام',
    'stats.title': 'الرعاية الصحية على نطاق واسع',
    'stats.subtitle': 'نتائج حقيقية من عيادات حقيقية حول العالم.',
    'stats.clinics': 'عيادات حول العالم',
    'stats.satisfaction': 'معدل الرضا',
    'stats.appointments': 'مواعيد مُدارة',
    'stats.countries': 'بلدان مغطاة',

    'pricing.label': 'الأسعار',
    'pricing.title': 'أسعار واضحة وبسيطة',
    'pricing.subtitle': 'ابدأ مجانًا ثم كبر مع نموك. بدون رسوم مخفية ولا مفاجآت. يمكنك الإلغاء في أي وقت.',

    'pricing.starter.name': 'Starter',
    'pricing.starter.desc': 'مناسب للممارسين الفرديين',
    'pricing.starter.price': '0',
    'pricing.starter.period': '/شهر',
    'pricing.starter.cta': 'ابدأ مجانًا',

    'pricing.pro.name': 'Professional',
    'pricing.pro.desc': 'للعيادات المتنامية',
    'pricing.pro.price': '49',
    'pricing.pro.period': '/شهر',
    'pricing.pro.cta': 'ابدأ التجربة المجانية',

    'pricing.enterprise.name': 'Enterprise',
    'pricing.enterprise.desc': 'للشبكات الصحية الكبيرة',
    'pricing.enterprise.price': '149',
    'pricing.enterprise.period': '/شهر',
    'pricing.enterprise.cta': 'تواصل مع المبيعات',
    'pricing.popular.badge': 'الأكثر شيوعًا',

    'problem.label': 'المشكلة',
    'problem.title': 'فرق الرعاية الصحية تغرق في الفوضى الإدارية',
    'problem.lead': 'كل يوم، يفقد الأطباء ساعات ثمينة بسبب الأنظمة المجزأة، وإدخال البيانات يدويًا، وسير العمل غير المترابط. النتيجة ليست فقط عدم الكفاءة — إنها الإرهاق، وأخطاء الفواتير، ورعاية المرضى المعرضة للخطر.',
    'problem.item1': 'سجلات المرضى مجزأة عبر أنظمة متعددة',
    'problem.item2': 'أخطاء الفواتير تكلف الآلاف شهريًا',
    'problem.item3': 'المواعيد الفائتة وتعارضات الجدولة',
    'problem.item4': 'ضغط الامتثال وقلق التدقيق',
    'problem.item5': 'إرهاق الموظفين من المهام الإدارية المتكررة',

    'testimonials.label': 'آراء العملاء',
    'testimonials.title': 'محبوب من فرق الرعاية الصحية',
    'testimonials.subtitle': 'اكتشف لماذا انتقلت آلاف العيادات إلى MediManage ولم تنظر للخلف.',

    'testimonial1.text': '"قلّل MediManage وقت الأعمال الإدارية لدينا بنسبة 60%. نظام الجدولة وحده وفّر لنا 20 ساعة أسبوعيًا. المرضى يحبون التذكيرات الآلية — وانخفضت الإلغاءات بشكل كبير."',
    'testimonial1.name': 'د. كريم الذهبي',
    'testimonial1.role': 'المدير، Berrada Family Practice',
    'testimonial2.text': '"لوحة التحليلات مذهلة. أخيرًا نرى أي الخدمات ترفع الإيرادات وأين نفقد الأموال. لقد عاد علينا الاستثمار من أول شهر."',
    'testimonial2.name': 'د. اسماء برادة',
    'testimonial2.role': 'المديرة، الأطلس للصحة',
    'testimonial3.text': '"قمنا بتقييم 12 أداة لإدارة العيادات قبل اختيار MediManage. تجربة الاستخدام تتفوّق بوضوح على الباقي. تدريب فريقنا المكون من 30 شخصًا استغرق يومًا واحدًا فقط."',
    'testimonial3.name': 'يسرى بن جلون',
    'testimonial3.role': 'COO، Wellness Partners Group',

    'cta.title.part1': 'جاهز لتحديث عيادتك',
    'cta.title.part2': '?',
    'cta.subtitle': 'انضم إلى 2500+ عيادة توفر الوقت وتزيد الإيرادات مع MediManage. ابدأ تجربتك المجانية اليوم — بدون بطاقة ائتمان.',
    'cta.primary': 'ابدأ مجانًا →',
    'cta.secondary': 'تواصل معنا',

    'footer.product': 'المنتج',
    'footer.company': 'الشركة',
    'footer.resources': 'الموارد',

    'footer.features': 'الميزات',
    'footer.pricing': 'الأسعار',
    'footer.integrations': 'التكاملات',
    'footer.changelog': 'سجل التحديثات',
    'footer.apiDocs': 'مستندات API',

    'footer.about': 'من نحن',
    'footer.blog': 'المدونة',
    'footer.careers': 'وظائف',
    'footer.press': 'الصحافة',
    'footer.contact': 'تواصل معنا',
    'footer.subscribe.title': 'الاشتراك في النشرة الإخبارية',
    'footer.subscribe.button': 'اشتراك',



    'footer.helpCenter': 'مركز المساعدة',
    'footer.community': 'المجتمع',
    'footer.webinars': 'ندوات عبر الإنترنت',
    'footer.security': 'الأمان',
    'footer.hipaa': 'امتثال HIPAA',

    'footer.desc': 'منصة إدارة العيادات الشاملة المصممة لفرق الرعاية الصحية الحديثة. حسّن العمليات، أسعد المرضى، ووسّع نشاطك.',

    'footer.legal.privacy': 'سياسة الخصوصية',
    'footer.legal.terms': 'شروط الخدمة',
    'footer.legal.cookie': 'سياسة ملفات تعريف الارتباط',

    'float.schedule.title': 'جدول اليوم',
    'float.schedule.badge': '4 متبقّية',
    'float.patient.title': 'ملخص المريض',
    'float.revenue.title': 'الإيرادات',
    'float.revenue.change': '↑ 24%',
    'float.notif.title': 'الإشعارات',
    'float.analytics.title': 'مرضى هذا الأسبوع',
    'social.proof.stat1': 'عيادات نشطة',
    'social.proof.stat2': 'مرضى مُدارون',
    'social.proof.stat3': 'اتفاقية وقت التشغيل',
    'social.proof.stat4': 'التقييم المتوسط',
    'float.notif.item1': 'تم تأكيد الموعد الساعة 2:30',
    'float.notif.item2': 'نتائج المختبر جاهزة',
    'float.notif.item3': 'تجديد الوصفة قيد الانتظار',

    'float.appt.sarah': 'كوثر المغاري',
    'float.appt.michael': 'يوسف كمال',
    'float.appt.emily': 'محمد سعيدي',
    'float.appt.t1': '9:00 ص — فحص',
    'float.appt.t2': '10:30 ص — متابعة',
    'float.appt.t3': '1:00 م — استشارة',

    'float.patient.name': 'كوثر المغاري',
    'float.patient.meta': 'أنثى • 34 سنة',
    'float.patient.visits': 'زيارات',
    'float.patient.rx': 'وصفات نشطة',

    'float.analytics.value': '284',
    'float.analytics.sub': '↑ 12% مقابل الأسبوع الماضي',
    'float.revenue.amount': '$48,290',

    'footer.copyright': '© 2026 MediManage. جميع الحقوق محفوظة.',

    // Contact
    'contact.label': 'تواصل معنا',
    'contact.title': 'هل أنت مستعد لتحسين عيادتك؟',
    'contact.subtitle': 'أخبرنا باحتياجاتك، وسنرد عليك بسرعة لتحديد موعد عرض توضيحي أو الإجابة على أسئلتك.',

    'contact.email.label': 'البريد الإلكتروني',
    'contact.email.value': 'support@medimanage.com',
    'contact.phone.label': 'اتصل بنا',
    'contact.phone.value': '+212 6 22 55 00 10',
    'contact.hours.label': 'ساعات العمل',
    'contact.hours.value': 'الاثنين - الجمعة: 9 صباحاً - 6 مساءً',

    'contact.trust.ariaLabel': 'مؤشرات الثقة',
    'contact.trust.hipaa': 'متوافق مع HIPAA',
    'contact.trust.encryption': 'تشفير 256-بت',
    'contact.trust.response': 'الرد خلال 24 ساعة',

    'contact.methods.ariaLabel': 'وسائل التواصل',

    'contact.form.ariaLabel': 'نموذج التواصل',
    'contact.form.requiredHint': 'حقل مطلوب',
    'contact.form.name': 'الاسم الكامل',
    'contact.form.name.placeholder': 'محمد محمد',
    'contact.form.email': 'البريد الإلكتروني',
    'contact.form.email.placeholder': 'mohamed@example.com',
    'contact.form.phone': 'رقم الهاتف',
    'contact.form.phone.placeholder': '+212 6 00 00 00 00',
    'contact.form.org': 'العيادة / المؤسسة',
    'contact.form.org.placeholder': 'اسم عيادتك',
    'contact.form.subject': 'أنا مهتم بـ',
    'contact.form.message': 'الرسالة',
    'contact.form.message.placeholder': 'أخبرنا عن عيادتك وكيف يمكننا مساعدتك...',
    'contact.form.newsletter': 'أرغب في تلقي نصائح إدارة الرعاية الصحية وتحديثات المنتج',

    'contact.form.submit': 'إرسال الرسالة',
    'contact.form.sending': 'جارٍ الإرسال...',
    'contact.form.privacy.part1': 'بإرسال هذا النموذج فإنك توافق على',
    'contact.form.privacy.privacyPolicy': 'سياسة الخصوصية',
    'contact.form.privacy.part2': 'و',
    'contact.form.privacy.termsOfService': 'شروط الاستخدام',

    'contact.subject.default': 'اختر موضوعاً...',
    'contact.subject.demo': 'حجز عرض توضيحي',
    'contact.subject.pricing': 'معلومات الأسعار',
    'contact.subject.support': 'الدعم التقني',
    'contact.subject.partnership': 'فرص الشراكة',
    'contact.subject.other': 'استفسار آخر',

    'contact.success.title': 'تم إرسال الرسالة بنجاح!',
    'contact.success.text': 'شكراً لتواصلك معنا. سنرد عليك خلال 24 ساعة.',

    'contact.error.submit': 'حدث خطأ ما. حاول مرة أخرى.',
    'contact.error.name': 'الاسم مطلوب',
    'contact.error.email': 'يرجى إدخال بريد إلكتروني صحيح',
    'contact.error.subject': 'يرجى اختيار موضوع',
    'contact.error.message': 'يجب أن تحتوي الرسالة على 10 أحرف على الأقل',

    'contact.name': 'اسمك',
    'contact.email': 'البريد الإلكتروني',
    'contact.message': 'الرسالة',
    'contact.submit': 'إرسال',
    'contact.success': 'تم إرسال الرسالة! سنتواصل معك قريباً.',

  },
};

function normalizeInitialLang(storageKey) {
  const stored = window.localStorage.getItem(storageKey);
  if (stored === 'en' || stored === 'fr' || stored === 'ar') return stored;
  return 'en';
}

export function useTranslator(storageKey = LANG_STORAGE_KEY) {
  const [lang, setLang] = useState(() => normalizeInitialLang(storageKey));

  useEffect(() => {
    window.localStorage.setItem(storageKey, lang);
  }, [lang, storageKey]);

  const t = useCallback(
    (key) => dict?.[lang]?.[key] ?? dict.en?.[key] ?? key,
    [lang]
  );

  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  return useMemo(
    () => ({
      lang,
      setLang,
      t,
      dir,
      LANGUAGES,
      storageKey,
    }),
    [lang, t, dir, storageKey]
  );
}
