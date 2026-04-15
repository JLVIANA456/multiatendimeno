import { memo } from "react";

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
};

/**
 * SearchInput isolado em seu próprio componente.
 * 
 * O estado de digitação fica AQUI, então apenas este componente
 * re-renderiza enquanto o usuário digita — a ChatList não é afetada
 * até que o valor final seja passado para cima pelo onChange.
 */
function SearchInput({ value, onChange }: SearchInputProps) {
  return (
    <div className="relative group px-2">
      <i className="fa-solid fa-magnifying-glass absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary-400 transition-colors text-xs pointer-events-none" />
      <input
        type="text"
        placeholder="Buscar conversa..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-light text-gray-600 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-200 transition-all"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
        >
          <i className="fa-solid fa-xmark text-xs" />
        </button>
      )}
    </div>
  );
}

export default memo(SearchInput);
