"use client"
import { Accordion, AccordionItem } from "@heroui/react";

export default function Faq() {
    return (
        <Accordion className="bg-gray-100 max-w-4xl mx-auto">
            <AccordionItem title="Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.">
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.</p>
            </AccordionItem> 
            <AccordionItem title="Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.">
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.</p>
            </AccordionItem> 
            <AccordionItem title="Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.">
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.</p>
            </AccordionItem> 
            <AccordionItem title="Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.">
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.</p>
            </AccordionItem>                                    
        </Accordion>
    );
}