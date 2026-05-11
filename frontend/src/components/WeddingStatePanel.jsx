import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  Clock3,
  Gem,
  Globe,
  Image as ImageIcon,
  Mail,
  MapPin,
  Navigation,
  Palette,
  Phone,
  UsersRound,
  Utensils,
  WalletCards,
} from 'lucide-react';
import axios from 'axios';

// ─── Collapsible Section ────────────────────────────────────────

function Section({ icon, label, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="state-section">
      <div className="state-section-header" onClick={() => setOpen(!open)}>
        <div className="state-section-label">
          {icon} {label}
        </div>
        <ChevronDown size={14} className={`state-section-chevron ${open ? 'open' : ''}`} />
      </div>
      {open && <div className="state-section-body">{children}</div>}
    </div>
  );
}

function toWebUrl(url) {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url.replace(/^\/+/, '')}`;
}

function googleMapsUrl(name, location) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name || ''} ${location || ''}`.trim())}`;
}

function formatMoney(amount, currency = 'USD') {
  return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));
}

function formatCategory(category) {
  return category
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, letter => letter.toUpperCase());
}

function venueImageUrl(venue) {
  if (venue.photoUrl) return venue.photoUrl;
  const query = encodeURIComponent(`${venue.name || ''} ${venue.location || ''} wedding venue`);
  return `https://source.unsplash.com/800x600/?${query}`;
}


// ─── Main Panel ─────────────────────────────────────────────────

export default function WeddingStatePanel({ state, visible, sessionId, setState }) {
  if (!state) return null;

  const { userContext, styleProfile, financials, venues, vendors, timeline, catering } = state;

  const hasStyle = styleProfile?.theme || (styleProfile?.colors?.length > 0);
  const hasBudget = financials?.totalBudget > 0;
  const hasVenues = venues?.length > 0;
  const hasVendors = vendors?.length > 0;
  const hasTimeline = timeline?.length > 0;
  const hasCatering = catering?.caterers?.length > 0 || catering?.menuOptions?.length > 0;
  const vendorGroups = (vendors || []).reduce((groups, vendor) => {
    const category = vendor.category || 'Vendor';
    groups[category] = groups[category] || [];
    groups[category].push(vendor);
    return groups;
  }, {});
  const selectedCaterer = catering?.caterers?.find(c => c.id === catering.selectedCatererId);
  const visibleMenus = selectedCaterer?.menus?.length ? selectedCaterer.menus : catering?.menuOptions || [];

  const handleSelectCaterer = async (catererId) => {
    if (!sessionId) return;
    try {
      const res = await axios.post('/api/wedding/select-caterer', { sessionId, catererId });
      if (res.data.success && setState) {
        setState(res.data.state);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectMenu = async (menuId, catererId = selectedCaterer?.id) => {
    if (!sessionId) return;
    try {
      const res = await axios.post('/api/wedding/select-menu', { sessionId, menuId, catererId });
      if (res.data.success && setState) {
        setState(res.data.state);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className={`state-panel ${!visible ? 'hidden' : ''}`}>
      <div className="state-panel-header">
        <div className="state-panel-title">Wedding Plan</div>
      </div>

      <div className="state-panel-content">
        {/* User Context */}
        <Section icon={<UsersRound size={16} />} label="Guest Details" defaultOpen={true}>
          {userContext?.culture || userContext?.budget || userContext?.guestCount ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {userContext.culture && <div><strong>Culture:</strong> {userContext.culture}</div>}
              {userContext.guestCount > 0 && <div><strong>Guests:</strong> {userContext.guestCount}</div>}
              {userContext.location && <div><strong>Location:</strong> {userContext.location}</div>}
              {userContext.date && <div><strong>Date:</strong> {userContext.date}</div>}
              {userContext.vibe?.length > 0 && (
                <div>
                  <strong>Vibe: </strong>
                  {userContext.vibe.map((v, i) => <span key={i} className="state-tag">{v}</span>)}
                </div>
              )}
              {userContext.nonNegotiables?.length > 0 && (
                <div>
                  <strong>Must-haves: </strong>
                  {userContext.nonNegotiables.map((n, i) => <span key={i} className="state-tag">{n}</span>)}
                </div>
              )}
            </div>
          ) : (
            <div className="state-empty">No details yet — start chatting!</div>
          )}
        </Section>

        {/* Style Profile */}
        <Section icon={<Palette size={16} />} label="Style Profile" defaultOpen={hasStyle}>
          {hasStyle ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {styleProfile.theme && <div><strong>Theme:</strong> {styleProfile.theme}</div>}
              {styleProfile.colors?.length > 0 && (
                <div>
                  <strong>Palette: </strong>
                  {styleProfile.colors.map((c, i) => (
                    <span key={i} className="state-tag color-tag">
                      <span className="color-dot" style={{ backgroundColor: c }}></span>
                      {c}
                    </span>
                  ))}
                </div>
              )}
              {styleProfile.decorElements?.length > 0 && (
                <div>
                  <strong>Decor: </strong>
                  {styleProfile.decorElements.map((d, i) => <span key={i} className="state-tag">{d}</span>)}
                </div>
              )}
              {styleProfile.rituals?.length > 0 && (
                <div>
                  <strong>Rituals: </strong>
                  {styleProfile.rituals.map((r, i) => <span key={i} className="state-tag">{r}</span>)}
                </div>
              )}
              {styleProfile.photographyStyle && <div><strong>Photo Style:</strong> {styleProfile.photographyStyle}</div>}
              {styleProfile.dressCode && <div><strong>Dress Code:</strong> {styleProfile.dressCode}</div>}
              
            </div>
          ) : (
            <div className="state-empty">Ask about wedding themes to populate this</div>
          )}
        </Section>

        {/* Budget */}
        <Section icon={<WalletCards size={16} />} label="Budget" defaultOpen={hasBudget}>
          {hasBudget ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="budget-hero">
                <span>{financials.budgetProvided ? 'Working budget' : 'Estimated budget'}</span>
                <strong>{formatMoney(financials.totalBudget, financials.currency)}</strong>
              </div>
              {financials.estimatedRequired > 0 && (
                <div className="budget-metrics">
                  <div>
                    <span>Required</span>
                    <strong>{formatMoney(financials.estimatedRequired, financials.currency)}</strong>
                  </div>
                  <div>
                    <span>Per guest</span>
                    <strong>{formatMoney(financials.costPerGuest, financials.currency)}</strong>
                  </div>
                  {financials.budgetGap > 0 && (
                    <div className="over-budget">
                      <span>Gap</span>
                      <strong>{formatMoney(financials.budgetGap, financials.currency)}</strong>
                    </div>
                  )}
                </div>
              )}
              {financials.feasibility && (
                <span className={`feasibility-badge ${financials.feasibility}`}>
                  {financials.feasibility === 'highly_feasible' && 'Highly Feasible'}
                  {financials.feasibility === 'feasible' && 'Feasible'}
                  {financials.feasibility === 'tight' && '⚠️ Tight Budget'}
                  {financials.feasibility === 'needs_revision' && '❌ Needs Revision'}
                </span>
              )}
              {financials.allocation && Object.keys(financials.allocation).length > 0 && (
                <div>
                  {Object.entries(financials.allocation).map(([cat, amount]) => {
                    const pct = financials.totalBudget > 0 ? (amount / financials.totalBudget) * 100 : 0;
                    return (
                      <div key={cat} className="budget-item">
                        <span className="budget-label">{formatCategory(cat)}</span>
                        <div className="budget-bar-track">
                          <div className="budget-bar-fill" style={{ width: `${pct}%` }}></div>
                        </div>
                        <span className="budget-amount">{formatMoney(amount, financials.currency)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
              {financials.warnings?.length > 0 && (
                <div>
                  {financials.warnings.map((w, i) => (
                    <div key={i} className="warning-item">
                      <AlertTriangle size={13} className="warning-icon" />
                      {w}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="state-empty">Mention a budget to see the breakdown</div>
          )}
        </Section>

        {/* Venues */}
        <Section icon={<MapPin size={16} />} label={`Venues${hasVenues ? ` (${venues.length})` : ''}`} defaultOpen={hasVenues}>
          {hasVenues ? (
            venues.map((v, i) => (
              <div key={i} className="venue-card">
                <img
                  src={venueImageUrl(v)}
                  alt={`${v.name} venue`}
                  className="venue-image"
                  loading="lazy"
                />
                <div className="venue-name">{v.name}</div>
                <div className="venue-location">{v.location}</div>
                <div className="venue-tags">
                  {v.capacity && <span className="state-tag">Guests {v.capacity}</span>}
                  {v.estimatedCost && <span className="state-tag">{v.estimatedCost}</span>}
                  {v.styleMatch && <span className="state-tag">Style {v.styleMatch}</span>}
                  {v.ritualCompatible && <span className="state-tag">Ritual OK</span>}
                </div>
                {v.hotelSuggestions?.length > 0 && (
                  <div className="mini-list">
                    <strong>Nearby stays:</strong> {v.hotelSuggestions.join(', ')}
                  </div>
                )}
                <div className="card-actions">
                  <a
                    className="icon-link"
                    href={v.mapUrl || googleMapsUrl(v.name, v.location)}
                    target="_blank"
                    rel="noreferrer"
                    title="Open in Google Maps"
                  >
                    <MapPin size={14} /> Map
                  </a>
                  <a
                    className="icon-link"
                    href={`https://www.google.com/travel/hotels?q=${encodeURIComponent(`${v.location || v.name} hotels`)}`}
                    target="_blank"
                    rel="noreferrer"
                    title="Search nearby hotels"
                  >
                    <Navigation size={14} /> Hotels
                  </a>
                </div>
              </div>
            ))
          ) : (
            <div className="state-empty">Ask about venues to see options</div>
          )}
        </Section>

        {/* Catering */}
        <Section icon={<Utensils size={16} />} label="Catering & Menu" defaultOpen={hasCatering}>
          {hasCatering ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {catering.caterers?.length > 0 && (
                <div className="vendor-category">
                  <div className="vendor-category-title">Choose a caterer</div>
                  {catering.caterers.map((caterer) => (
                    <div key={caterer.id} className="venue-card" style={{ border: catering.selectedCatererId === caterer.id ? '2px solid var(--rose-gold)' : '' }}>
                      <div className="venue-name" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {caterer.name}
                        {catering.selectedCatererId === caterer.id && <CheckCircle size={16} color="var(--rose-gold)" />}
                      </div>
                      {caterer.specialty && <div className="venue-location">{caterer.specialty}</div>}
                      <div className="venue-tags">
                        {caterer.estimatedCost && <span className="state-tag">{caterer.estimatedCost}</span>}
                      </div>
                      <div className="card-actions">
                        {caterer.website && (
                          <a className="icon-link" href={toWebUrl(caterer.website)} target="_blank" rel="noreferrer" title="Website">
                            <Globe size={14} /> Website
                          </a>
                        )}
                        {caterer.phone && <a className="icon-link" href={`tel:${caterer.phone}`} title={caterer.phone}><Phone size={14} /> Call</a>}
                        {caterer.email && <a className="icon-link" href={`mailto:${caterer.email}`} title={caterer.email}><Mail size={14} /> Email</a>}
                      </div>
                      {catering.selectedCatererId !== caterer.id && (
                        <button className="header-btn select-btn" onClick={() => handleSelectCaterer(caterer.id)}>
                          Select Caterer
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {visibleMenus.length > 0 && (
                <div className="vendor-category">
                  <div className="vendor-category-title">
                    {selectedCaterer ? `${selectedCaterer.name} menu` : 'Menu options'}
                  </div>
                  {visibleMenus.map((menu) => (
                    <div key={menu.id} className="venue-card" style={{ border: catering.selectedMenuId === menu.id ? '2px solid var(--rose-gold)' : '' }}>
                      <div className="venue-name" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {menu.name}
                        {catering.selectedMenuId === menu.id && <CheckCircle size={16} color="var(--rose-gold)" />}
                      </div>
                      {menu.description && <div className="venue-location">{menu.description}</div>}
                      <ul style={{ margin: '8px 0', paddingLeft: '16px', fontSize: '12px', color: 'var(--text-main)' }}>
                        {menu.items?.map((item, idx) => <li key={idx}>{item}</li>)}
                      </ul>
                      {catering.selectedMenuId !== menu.id && (
                        <button className="header-btn select-btn" onClick={() => handleSelectMenu(menu.id)}>
                          Select Menu
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="state-empty">Ask the Catering Director to plan a menu</div>
          )}
        </Section>

        {/* Vendors */}
        <Section icon={<Gem size={16} />} label={`Vendors${hasVendors ? ` (${vendors.length})` : ''}`} defaultOpen={hasVendors}>
          {hasVendors ? (
            vendors.map((v, i) => (
              <div key={i} className="venue-card">
                {v.category && <div className="vendor-category-title">{v.category}</div>}
                <div className="venue-name">{v.name || v.category}</div>
                <div className="venue-location">{v.specialty}</div>
                {v.whyMatch && <div className="mini-list">{v.whyMatch}</div>}
                <div className="venue-tags">
                  {v.estimatedCost && <span className="state-tag">{v.estimatedCost}</span>}
                  {v.styleMatch && <span className="state-tag">Style {v.styleMatch}</span>}
                </div>
                
                {/* Vendor Contact Links */}
                {(v.website || v.phone || v.email) && (
                  <div style={{ display: 'flex', gap: '12px', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
                    {v.website && (
                      <a href={toWebUrl(v.website)} target="_blank" rel="noreferrer" title="Website" style={{ color: 'var(--text-muted)', transition: 'color 0.2s' }}>
                        <Globe size={14} />
                      </a>
                    )}
                    {v.phone && (
                      <a href={`tel:${v.phone}`} title={v.phone} style={{ color: 'var(--text-muted)', transition: 'color 0.2s' }}>
                        <Phone size={14} />
                      </a>
                    )}
                    {v.email && (
                      <a href={`mailto:${v.email}`} title={v.email} style={{ color: 'var(--text-muted)', transition: 'color 0.2s' }}>
                        <Mail size={14} />
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="state-empty">Ask about vendors to see matches</div>
          )}
        </Section>

        {/* Timeline */}
        <Section icon={<Clock3 size={16} />} label={`Timeline${hasTimeline ? ` (${timeline.length} items)` : ''}`} defaultOpen={hasTimeline}>
          {hasTimeline ? (
            timeline.map((t, i) => (
              <div key={i} className="timeline-item">
                <div className="timeline-time">{t.time}</div>
                <div>
                  <div className="timeline-activity">{t.activity}</div>
                  {t.responsible && <div className="timeline-responsible">→ {t.responsible}</div>}
                </div>
              </div>
            ))
          ) : (
            <div className="state-empty">Request a timeline to see the schedule</div>
          )}
        </Section>
      </div>
    </div>
  );
}
