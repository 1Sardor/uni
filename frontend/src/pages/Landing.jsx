import React from "react";
import Hero from "@/components/landing/Hero";
import SavingsCounter from "@/components/landing/SavingsCounter";
import NewDeals from "@/components/landing/NewDeals";
import CategoryGrid from "@/components/landing/CategoryGrid";

export default function Landing() {
  return (
    <>
      <Hero />
      <SavingsCounter value={1250000} currency="UZS " />
      <NewDeals />
      <CategoryGrid />
    </>
  );
}
