import React, { useEffect, useMemo, useState } from 'react';
import API from '../../services/api';

const Badge = ({ children }) => (
  <span className="ml-2 inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
    {children}
  </span>
);

const SectionTitle = ({ icon, title, badge }) => (
  <div className="flex items-center gap-2 pt-2">
    <i className={`${icon} text-gray-700`} />
    <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
    {badge ? <Badge>{badge}</Badge> : null}
  </div>
);

function safeParseJson(value) {
  try {
    return JSON.parse(value);
  } catch (err) {
    return null;
  }
}

function getStoredUser() {
  if (typeof window === 'undefined') return null;
  const candidates = ['user', 'authUser', 'currentUser', 'loggedInUser'];
  for (const key of candidates) {
    const raw = window.localStorage.getItem(key);
    if (!raw) continue;
    const parsed = safeParseJson(raw);
    if (parsed && (parsed.name || parsed.email || parsed.phone)) {
      return parsed;
    }
  }
  return null;
}

const SEVERITY_OPTIONS = [
  { value: "normal", label: "Normal (No adjustment)", multiplier: 1 },
  { value: "high", label: "High (+25%)", multiplier: 1.25 },
  { value: "critical", label: "Critical (+50%)", multiplier: 1.5 },
];

const formatPesoNoDecimals = (n) => {
  const num = Number(n || 0);
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(num);
};

const CreateTicket = ({ onBack, onSubmit }) => {
  const [ticketType, setTicketType] = useState('');
  const [providerId, setProviderId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [severity, setSeverity] = useState('normal');
  
  // Service configuration data
  const [serviceProviders, setServiceProviders] = useState([]);
  const [serviceCategories, setServiceCategories] = useState([]);
  const [serviceTemplates, setServiceTemplates] = useState([]);
  const [templateDetails, setTemplateDetails] = useState(null);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  const priority = 'medium';
  const user = useMemo(() => getStoredUser(), []);
  const requestorName = user?.name || 'Auto-filled from logged-in user';
  const contactInfo = user?.phone || user?.email || 'Auto-filled from your profile';

  const storedLocation = typeof window === 'undefined' ? '' : window.localStorage.getItem('location') || window.localStorage.getItem('currentLocation') || window.localStorage.getItem('branchLocation') || '';
  const roomArea = storedLocation || 'Auto-filled from current location/branch';

  // Fetch locations on component mount
  useEffect(() => {
    (async () => {
      try {
        if (user?.accountId) {
          const locationsData = await API.getLocations(user.accountId);
          if (locationsData && locationsData.locations) {
            setLocations(locationsData.locations);
            // Set default location
            if (locationsData.default) {
              setSelectedLocation(locationsData.default);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load locations', err);
      }
    })();
  }, [user?.accountId]);

  // Fetch service providers on mount
  useEffect(() => {
    (async () => {
      try {
        setLoadingProviders(true);
        const response = await API.getServiceProviders();
        if (response && response.providers) {
          setServiceProviders(response.providers);
        }
      } catch (err) {
        console.error('Failed to load service providers', err);
      } finally {
        setLoadingProviders(false);
      }
    })();
  }, []);

  // Fetch categories when provider changes
  useEffect(() => {
    (async () => {
      if (!providerId) {
        setServiceCategories([]);
        setCategoryId('');
        return;
      }
      try {
        setLoadingCategories(true);
        const response = await API.getServiceCategories(providerId);
        if (response && response.categories) {
          setServiceCategories(response.categories);
        }
      } catch (err) {
        console.error('Failed to load service categories', err);
      } finally {
        setLoadingCategories(false);
      }
    })();
    
    // Reset category and template when provider changes
    setCategoryId('');
    setTemplateId('');
    setTemplateDetails(null);
  }, [providerId]);

  // Fetch templates when category changes
  useEffect(() => {
    (async () => {
      if (!categoryId) {
        setServiceTemplates([]);
        setTemplateId('');
        setTemplateDetails(null);
        return;
      }
      try {
        setLoadingTemplates(true);
        const response = await API.getServiceTemplates(categoryId);
        if (response && response.templates) {
          setServiceTemplates(response.templates);
          // Auto-select first template
          if (response.templates.length > 0) {
            setTemplateId(response.templates[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load service templates', err);
      } finally {
        setLoadingTemplates(false);
      }
    })();
    
    // Reset template when category changes
    setTemplateId('');
    setTemplateDetails(null);
  }, [categoryId]);

  // Fetch template details when template changes
  useEffect(() => {
    (async () => {
      if (!templateId) {
        setTemplateDetails(null);
        return;
      }
      try {
        const response = await API.getServiceTemplateDetail(templateId);
        if (response && response.template) {
          setTemplateDetails(response.template);
        }
      } catch (err) {
        console.error('Failed to load template details', err);
      }
    })();
  }, [templateId]);

  // Reset severity when category changes
  useEffect(() => {
    setSeverity('normal');
  }, [categoryId]);

  const canSubmit = Boolean(ticketType && providerId && categoryId && templateId && description.trim());

  const autoGenerateTitle = () => {
    const left = templateDetails?.name || (ticketType === 'incident' ? 'Incident Report' : 'Service Report');
    const snippet = description.trim().slice(0, 60);
    return snippet ? `${left} - ${snippet}` : left;
  };

  const severityObj = useMemo(
    () => SEVERITY_OPTIONS.find((o) => o.value === severity) || SEVERITY_OPTIONS[0],
    [severity]
  );

  const totalCost = useMemo(() => {
    if (!templateDetails) return 0;
    const base = Number(templateDetails.base_rate || 0);
    const mult = Number(severityObj.multiplier || 1);
    return Math.round(base * mult);
  }, [templateDetails, severityObj]);

  const showPricingCard = Boolean(templateId && templateDetails);

  const handleFileChange = (event) => {
    const picked = Array.from(event.target.files || []);
    if (!picked.length) return;
    setFiles((prev) => [...prev, ...picked]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmitReal = async () => {
    setLoading(true);
    try {
      const computedTitle = autoGenerateTitle().trim();
      const payload = {
        title: computedTitle,
        description: description.trim(),
        priority,
        ticketType: ticketType,
        location: selectedLocation && selectedLocation.trim() ? selectedLocation : '-',
        issueType: templateDetails?.name || 'General',
        service_provider_id: providerId,
        service_category_id: categoryId,
        template_id: templateId,
        severity_adjustment: severity,
        cost: totalCost || 0,
      };

      const result = await API.createTicket(payload);
      if (result?.success && result?.ticket?.id) {
        const createdTicket = await API.getTicket(result.ticket.id);
        onSubmit(createdTicket);
      } else {
        alert('Failed to create ticket. Please try again.');
      }
    } catch (err) {
      console.error('Failed to create ticket', err);
      alert('Failed to create ticket. Check console for details.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="px-5 py-6">
      <div className="mb-4">
        <div className="text-xs text-gray-500">New Request</div>
        <div className="text-lg font-semibold text-gray-900">New Request</div>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!canSubmit) return;
          setShowConfirm(true);
        }}
        className="space-y-5"
      >
        <div>
          <SectionTitle icon="fas fa-ticket-alt" title="Ticket Type" />
          <div className="mt-2 text-xs text-gray-500">Select Ticket Type</div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {[
              {
                kind: 'incident',
                title: 'Incident Report',
                description: 'Unexpected issues or emergencies',
                icon: 'fas fa-exclamation-triangle',
              },
              {
                kind: 'service',
                title: 'Service Report',
                description: 'Planned service requests',
                icon: 'fas fa-wrench',
              },
            ].map((item) => (
              <button
                key={item.kind}
                type="button"
                onClick={() => setTicketType(item.kind)}
                className={[
                  'w-full rounded-2xl border p-3 text-left transition',
                  ticketType === item.kind
                    ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-100'
                    : 'border-gray-200 bg-white hover:bg-gray-50',
                ].join(' ')}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={[
                      'h-10 w-10 rounded-xl grid place-items-center',
                      ticketType === item.kind
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700',
                    ].join(' ')}
                  >
                    <i className={item.icon} />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{item.title}</div>
                    <div className="text-xs text-gray-500">{item.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          {!ticketType && (
            <div className="mt-2 text-xs text-amber-600">Please select a ticket type to continue.</div>
          )}
        </div>

        <div className="pt-2">
          <SectionTitle
            icon="fas fa-user"
            title="Requester Information"
            badge="AUTO-FILLED"
          />
          <div className="mt-3 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Requester Name</label>
              <input
                value={requestorName}
                readOnly
                className="w-full rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-gray-800"
              />
              <div className="mt-1 text-[11px] text-gray-500">Auto-populated from logged-in user</div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Contact Information</label>
              <input
                value={contactInfo}
                readOnly
                className="w-full rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-gray-800"
              />
              <div className="mt-1 text-[11px] text-gray-500">Auto-populated from your profile</div>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <SectionTitle
            icon="fas fa-map-marker-alt"
            title="Location"
            badge="AUTO-FILLED"
          />
          <div className="mt-3">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Room / Area</label>
            <input
              value={selectedLocation || 'Loading location...'}
              readOnly
              className="w-full rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-gray-800"
            />
            <div className="mt-1 text-[11px] text-gray-500">Auto-populated from your account</div>
          </div>
        </div>

        <div className="pt-2">
          <SectionTitle
            icon="fas fa-clipboard-list"
            title="Service Provider & Request Details"
          />
          <div className="mt-3 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                Service Provider
              </label>
              <select
                className="w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                value={providerId}
                onChange={(event) => setProviderId(event.target.value)}
                disabled={loadingProviders}
                required
              >
                <option value="">
                  {loadingProviders ? 'Loading providers...' : 'Select Service Provider'}
                </option>
                {serviceProviders.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.name}
                  </option>
                ))}
              </select>
              <div className="mt-1 text-[11px] text-gray-500">
                {loadingProviders ? 'Loading...' : 'Select the service provider'}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                Service Category
              </label>
              <select
                className="w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                disabled={!providerId || loadingCategories}
                required
              >
                <option value="">
                  {!providerId 
                    ? 'Select a provider first' 
                    : loadingCategories 
                    ? 'Loading categories...' 
                    : 'Select Service Category'}
                </option>
                {serviceCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <div className="mt-1 text-[11px] text-gray-500">
                Categories under the selected provider
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                Item Type / Template
              </label>
              <select
                className="w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                value={templateId}
                onChange={(event) => setTemplateId(event.target.value)}
                disabled={!categoryId || loadingTemplates}
                required
              >
                <option value="">
                  {!categoryId
                    ? 'Select a category first'
                    : loadingTemplates
                    ? 'Loading templates...'
                    : 'Select Item Type / Template'}
                </option>
                {serviceTemplates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
              <div className="mt-1 text-[11px] text-gray-500">Available service templates for this category</div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                Description
              </label>
              <textarea
                className="w-full min-h-[120px] rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Provide detailed description of the request..."
                required
              />
            </div>
          </div>
        </div>

        <div className="pt-2">
          <SectionTitle icon="fas fa-fire" title="Service Fee" />

          {!showPricingCard ? (
            <div className="mt-3 rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-600">
              Select an <span className="font-semibold">Item Type / Template</span> to view the fee and total cost.
            </div>
          ) : (
            <div className="mt-3 rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="text-sm font-semibold text-gray-900">Service Pricing</div>
                <div className="text-[11px] text-gray-500">
                  Auto-populated from {templateDetails?.name || 'service template'} - Fee is calculated from base rate and severity adjustment.
                </div>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl bg-gray-50 border border-gray-100 p-3 text-center">
                    <div className="text-[10px] tracking-wide text-gray-500 font-semibold">
                      SERVICE CODE
                    </div>
                    <div className="mt-1 text-sm font-extrabold text-blue-600">
                      {templateDetails?.service_code || "—"}
                    </div>
                  </div>

                  <div className="rounded-xl bg-gray-50 border border-gray-100 p-3 text-center">
                    <div className="text-[10px] tracking-wide text-gray-500 font-semibold">
                      SLA
                    </div>
                    <div className="mt-1 text-sm font-extrabold text-emerald-600">
                      {templateDetails?.sla_display || "—"}
                    </div>
                  </div>

                  <div className="rounded-xl bg-gray-50 border border-gray-100 p-3 text-center">
                    <div className="text-[10px] tracking-wide text-gray-500 font-semibold">
                      BASE RATE
                    </div>
                    <div className="mt-1 text-sm font-extrabold text-gray-900">
                      {formatPesoNoDecimals(templateDetails?.base_rate || 0)}
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Severity Adjustment
                  </label>
                  <select
                    className="w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                  >
                    {SEVERITY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4 flex items-center justify-between">
                  <div className="text-xs font-semibold text-blue-600 tracking-wide">
                    TOTAL COST
                  </div>
                  <div className="text-xl font-extrabold text-blue-600">
                    {formatPesoNoDecimals(totalCost)}
                  </div>
                </div>

                <div className="mt-2 text-[11px] text-gray-500">
                  This total will be saved as the ticket cost.
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="pt-2">
          <SectionTitle icon="fas fa-paperclip" title="Attachments" />
          <label className="mt-3 block cursor-pointer rounded-xl border-2 border-dashed border-gray-200 bg-white p-6 text-center transition hover:border-blue-500 hover:bg-blue-50/40">
            <input
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-2xl bg-gray-100 text-gray-500">
              <i className="fas fa-cloud-upload-alt text-xl" />
            </div>
            <div className="text-sm font-medium text-gray-700">Tap to upload photos or documents</div>
            <div className="mt-1 text-[11px] text-gray-500">PNG, JPG, PDF up to 10MB</div>
          </label>

          {files.length > 0 && (
            <div className="mt-3 space-y-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between rounded-lg bg-gray-100 px-3 py-2 text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <i className="fas fa-file text-gray-600" />
                    <span className="truncate text-gray-800">{file.name}</span>
                  </div>
                  <button
                    type="button"
                    className="rounded-md px-2 py-1 text-red-600 hover:bg-red-50"
                    onClick={() => removeFile(index)}
                    aria-label="Remove file"
                  >
                    <i className="fas fa-times" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            className="flex-1 rounded-lg bg-gray-100 px-4 py-3 font-semibold text-gray-800 hover:bg-gray-200"
            onClick={onBack}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !canSubmit}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white shadow-md disabled:opacity-60"
          >
            {loading ? 'Creating...' : 'Confirm'}
          </button>
        </div>
      </form>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Confirm Submission</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to submit this ticket?</p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="px-5 py-2.5 rounded-lg bg-gray-100 text-gray-800 font-semibold hover:bg-gray-200"
                onClick={() => setShowConfirm(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60"
                onClick={async () => {
                  setShowConfirm(false);
                  await handleSubmitReal();
                }}
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Yes, Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateTicket;