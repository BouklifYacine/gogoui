import preview from '#.storybook/preview'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './accordion.tsx'

const meta = preview.meta({
  title: 'Mise en page/Accordion',
  component: Accordion,
  subcomponents: { AccordionItem, AccordionTrigger, AccordionContent },
  decorators: [(Story) => <div className="w-[32rem]">{Story()}</div>],
})

const questions = [
  [
    'Puis-je annuler à tout moment ?',
    'Oui, depuis vos paramètres, sans frais. Votre accès reste ouvert jusqu’à la fin du mois payé.',
  ],
  [
    'Mes données sont-elles exportables ?',
    'Vos clients, demandes et devis s’exportent en CSV à tout moment.',
  ],
  [
    'Combien de lieux puis-je gérer ?',
    'Un lieu par abonnement ; écrivez-nous pour plusieurs domaines.',
  ],
]

/**
 * A FAQ: one answer open at a time.
 */
export const Basic = meta.story({
  render: () => (
    <Accordion defaultValue={['0']}>
      {questions.map(([question, answer], index) => (
        <AccordionItem key={question} value={String(index)}>
          <AccordionTrigger>{question}</AccordionTrigger>
          <AccordionContent>{answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  ),
})

/**
 * Several sections open at once.
 */
export const Multiple = meta.story({
  render: () => (
    <Accordion multiple>
      {questions.map(([question, answer], index) => (
        <AccordionItem key={question} value={String(index)}>
          <AccordionTrigger>{question}</AccordionTrigger>
          <AccordionContent>{answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  ),
})
