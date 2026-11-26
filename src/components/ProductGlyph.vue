<script setup>
defineProps({ kind: String, color: String })
</script>

<template>
  <svg viewBox="0 0 144 81" aria-hidden="true" class="product-glyph" :style="{ color }">
    <ellipse cx="74" cy="67" rx="57" ry="9" fill="#080a0d" opacity=".64" />
    <g v-if="['gantry', 'yard', 'shipyard', 'carrier'].includes(kind)">
      <g fill="none" stroke-linecap="round">
        <path d="M12 65l30-17M99 74l29-17" stroke="#53616b" stroke-width="4"/>
        <path d="M17 61l26-14M102 70l24-13" stroke="currentColor" stroke-width="5"/>
        <path d="M19 60l16-37 8 24m60 22 15-35 7 23M25 46l14-6m70 15 13-5" stroke="currentColor" stroke-width="4.7"/>
        <path d="M35 24l82 10" stroke="currentColor" stroke-width="8"/>
        <path d="M35 21l82 10" stroke="#fff1d2" stroke-width="1.5" opacity=".56"/>
      </g>
      <path v-if="kind === 'yard' || kind === 'carrier'" d="M56 47l37 5-6 6-37-6z" fill="#82a69b"/>
      <path v-if="kind === 'shipyard'" d="M51 36h11v6H51z" fill="#43786f"/>
      <path d="M68 31h14v7H68z" fill="#43786f"/><path d="M73 38v11h5v-10m-2 10v5q0 5 4 2" fill="none" stroke="#8a9ba1" stroke-width="1.6"/>
    </g>
    <g v-else-if="kind === 'portal' || kind === 'quay'" fill="none" stroke-linejoin="round" stroke-linecap="round">
      <path d="M23 66l28-14m41 20 28-14" stroke="#53616b" stroke-width="4"/>
      <path d="M30 62l15-27 8 17m51 14L92 42l-9 13m-41-20 49 7" stroke="currentColor" stroke-width="6"/>
      <path v-if="kind === 'quay'" d="M43 34l9-18 36 5 31 12M15 31l108 13" stroke="currentColor" stroke-width="5"/>
      <path v-else d="M58 36l5-13m-5 13 48-22-31 29z" stroke="currentColor" stroke-width="4"/>
      <path d="M103 32v20m-5 1h10" stroke="#aab6bf" stroke-width="2"/>
    </g>
    <g v-else-if="['single', 'double', 'kbk'].includes(kind)">
      <path d="M11 36l25-13m69 32 23-13" stroke="#53616b" stroke-width="4" stroke-linecap="round"/>
      <path d="M15 34l20-11m72 29 17-10" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>
      <path v-if="kind === 'double'" d="M33 23l89 18v5L31 28z" fill="currentColor" opacity=".64"/>
      <path d="M20 28l94 18v7L20 35z" fill="currentColor"/><path d="M20 28l94 18 4-3-93-18z" fill="#fff0d1" opacity=".65"/>
      <path v-if="kind === 'double'" d="M64 33l12-7 16 4-10 7-1 7-17-3z" fill="#4c8178"/>
      <path v-else d="M62 38l18 3v6l-18-3z" fill="#4c8178"/>
      <path d="M70 44v13h7V45m-4 11v6q0 5 4 2" fill="none" stroke="#8a9ba1" stroke-width="1.6"/>
    </g>
    <g v-else-if="kind === 'jib'">
      <ellipse cx="46" cy="66" rx="12" ry="5" fill="#586168"/><ellipse cx="46" cy="64" rx="10" ry="4" fill="currentColor"/>
      <path d="M42 63V22l5-3 4 3v40l-4 2zM47 21l53 5v6l-53-5z" fill="currentColor"/>
      <path d="M48 22l52 5m-55-3v36m5-24 22-11" stroke="#fff0d1" stroke-width="1.7" opacity=".59"/>
      <path d="M77 32l10 1v6l-10-1z" fill="#4c8178"/><path d="M81 38v12h4m-3 0v5q0 4 4 1" fill="none" stroke="#8a9ba1" stroke-width="1.4"/>
    </g>
    <g v-else>
      <path d="M26 23l89 13v8L26 30z" fill="#6a7980"/><path d="M26 23l89 13 5-4-88-13z" fill="#9ca9ab"/>
      <path d="M50 38l30 3 8 7-8 7-30-5-6-5z" fill="currentColor"/><path d="M50 38l12-5 29 5-11 5z" fill="#779d92"/>
      <ellipse cx="80" cy="48" rx="8" ry="7" fill="#365d59"/><path d="M58 50v12l9 2V52m-4 10v5q0 5 4 3" fill="none" stroke="#8a9ba1" stroke-width="1.6"/>
    </g>
  </svg>
</template>
